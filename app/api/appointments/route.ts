import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmail, getAppointmentConfirmationEmail } from "@/lib/email";
import { formatDateTime, getAvailableSlots, parseLocalDate } from "@/lib/utils";
import {
  checkRateLimit,
  getClientId,
  validateRequired,
  validateEmail,
  validatePhone,
  validateName,
  authenticateRequest,
  sanitizeString,
  logSecurityEvent,
  createErrorResponse,
  addSecurityHeaders,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  
  if (!checkRateLimit(clientId)) {
    logSecurityEvent("RATE_LIMIT_EXCEEDED", "WARNING", { clientId, endpoint: "/api/appointments" });
    return createErrorResponse("Too many requests", 429);
  }

  try {
    const body = await request.json();
    const { serviceId, customerName, customerEmail, customerPhone, dateTime, holdToken } = body;

    // Input validation - OWASP A03
    const validationError = validateRequired({
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      dateTime,
      holdToken,
    });
    if (validationError) return createErrorResponse(validationError, 400);

    if (!validateEmail(customerEmail)) return createErrorResponse("Invalid email", 400);
    if (!validatePhone(customerPhone)) return createErrorResponse("Invalid phone", 400);
    if (!validateName(customerName)) return createErrorResponse("Invalid name", 400);

    // Verify serviceId exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return createErrorResponse("Service not found", 404);

    const [appointmentDate, appointmentTime] = dateTime.split("T");
    const selectedDate = parseLocalDate(appointmentDate);
    if (!selectedDate || !/^\d{2}:\d{2}(:\d{2})?$/.test(appointmentTime || "")) {
      return createErrorResponse("Invalid appointment date or time", 400);
    }

    const requestedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (requestedDateTime <= new Date()) {
      return createErrorResponse("Appointment time must be in the future", 400);
    }

    const startOfDay = new Date(selectedDate);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        dateTime: { gte: startOfDay, lte: endOfDay },
        status: { in: ["confirmed", "rescheduled"] },
      },
      select: { dateTime: true, service: { select: { duration: true } } },
    });
    const activeHolds = await prisma.appointmentHold.findMany({
      where: {
        dateTime: { gte: startOfDay, lte: endOfDay },
        expiresAt: { gt: new Date() },
        token: { not: sanitizeString(holdToken) },
      },
      select: { dateTime: true, service: { select: { duration: true } } },
    });

    const availableSlots = getAvailableSlots(
      selectedDate,
      [...existingAppointments, ...activeHolds].map((appointment) => ({
        dateTime: appointment.dateTime,
        duration: appointment.service.duration,
      })),
      service.duration
    );
    const selectedTime = appointmentTime.slice(0, 5);
    if (!availableSlots.includes(selectedTime)) {
      return createErrorResponse("Selected appointment time is no longer available", 409);
    }

    const booking = await prisma.$transaction(async (transaction) => {
      const hold = await transaction.appointmentHold.findFirst({
        where: {
          token: sanitizeString(holdToken),
          serviceId,
          dateTime: requestedDateTime,
          expiresAt: { gt: new Date() },
        },
      });
      if (!hold) throw new Error("HOLD_EXPIRED");

      let customer = await transaction.customer.findUnique({
        where: { email: customerEmail },
      });

      if (!customer) {
        customer = await transaction.customer.create({
          data: {
            name: sanitizeString(customerName),
            email: sanitizeString(customerEmail),
            phone: sanitizeString(customerPhone),
          },
        });
      }

      await transaction.appointmentHold.delete({ where: { id: hold.id } });
      const appointment = await transaction.appointment.create({
        data: {
          serviceId,
          customerId: customer.id,
          dateTime: requestedDateTime,
        },
        include: { service: true },
      });

      return { appointment, customer };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    const { appointment, customer } = booking;

    // Send confirmation email
    const emailHtml = getAppointmentConfirmationEmail(
      sanitizeString(customerName),
      appointment.service.name,
      formatDateTime(appointment.dateTime)
    );

    await sendEmail({
      to: customerEmail,
      subject: "Appointment Confirmed",
      html: emailHtml,
    });

    logSecurityEvent("APPOINTMENT_CREATED", "INFO", { appointmentId: appointment.id, customerId: customer.id });
    
    const response = NextResponse.json(appointment, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid JSON body", 400);
    }

    if (error instanceof Error && error.message === "HOLD_EXPIRED") {
      return createErrorResponse("Your time hold has expired", 409);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse("Selected appointment time is no longer available", 409);
    }

    logSecurityEvent("APPOINTMENT_ERROR", "ERROR", { error: String(error) });
    return createErrorResponse("Failed to create appointment", 500);
  }
}

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);

  if (!authenticateRequest(request)) {
    logSecurityEvent("UNAUTHORIZED", "WARNING", { clientId, endpoint: "/api/appointments" });
    return createErrorResponse("Unauthorized", 401);
  }

  
  if (!checkRateLimit(clientId)) {
    return createErrorResponse("Too many requests", 429);
  }

  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
        customer: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    const response = NextResponse.json(appointments);
    response.headers.set("Cache-Control", "private, no-store");
    return addSecurityHeaders(response);
  } catch (error) {
    logSecurityEvent("APPOINTMENT_FETCH_ERROR", "ERROR", { error: String(error) });
    return createErrorResponse("Failed to fetch appointments", 500);
  }
}
