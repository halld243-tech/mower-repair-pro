import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots, parseLocalDate } from "@/lib/utils";
import {
  checkRateLimit,
  getClientId,
  validateRequired,
  sanitizeString,
  logSecurityEvent,
  createErrorResponse,
  addSecurityHeaders,
} from "@/lib/security";

const HOLD_DURATION_MINUTES = 10;

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!checkRateLimit(clientId)) return createErrorResponse("Too many requests", 429);

  try {
    const body = await request.json();
    const { serviceId, dateTime } = body;
    const validationError = validateRequired({ serviceId, dateTime });
    if (validationError) return createErrorResponse(validationError, 400);

    const safeServiceId = sanitizeString(serviceId);
    const safeDateTime = sanitizeString(dateTime);
    const [appointmentDate, appointmentTime] = safeDateTime.split("T");
    const selectedDate = parseLocalDate(appointmentDate);
    if (!selectedDate || !/^\d{2}:\d{2}(:00)?$/.test(appointmentTime || "")) {
      return createErrorResponse("Invalid appointment date or time", 400);
    }

    const selectedTime = appointmentTime.slice(0, 5);
    const requestedDateTime = new Date(`${appointmentDate}T${selectedTime}:00`);
    if (requestedDateTime <= new Date()) {
      return createErrorResponse("Appointment time must be in the future", 400);
    }

    const service = await prisma.service.findUnique({ where: { id: safeServiceId } });
    if (!service) return createErrorResponse("Service not found", 404);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    const now = new Date();

    await prisma.appointmentHold.deleteMany({ where: { expiresAt: { lte: now } } });
    const [appointments, holds] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          dateTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ["confirmed", "rescheduled"] },
        },
        select: { dateTime: true, service: { select: { duration: true } } },
      }),
      prisma.appointmentHold.findMany({
        where: { dateTime: { gte: startOfDay, lte: endOfDay }, expiresAt: { gt: now } },
        select: { dateTime: true, service: { select: { duration: true } } },
      }),
    ]);

    const calendarEntries = [
      ...appointments,
      ...holds,
    ].map((entry) => ({ dateTime: entry.dateTime, duration: entry.service.duration }));
    if (!getAvailableSlots(selectedDate, calendarEntries, service.duration).includes(selectedTime)) {
      return createErrorResponse("Selected appointment time is no longer available", 409);
    }

    const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
    const hold = await prisma.appointmentHold.create({
      data: {
        token: randomUUID(),
        serviceId: safeServiceId,
        dateTime: requestedDateTime,
        expiresAt,
      },
    });

    const response = NextResponse.json(
      { holdToken: hold.token, expiresAt: hold.expiresAt },
      { status: 201 }
    );
    return addSecurityHeaders(response);
  } catch (error) {
    if (error instanceof SyntaxError) return createErrorResponse("Invalid JSON body", 400);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse("Selected appointment time is no longer available", 409);
    }
    logSecurityEvent("APPOINTMENT_HOLD_ERROR", "ERROR", { error: String(error), clientId });
    return createErrorResponse("Failed to hold appointment time", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const clientId = getClientId(request);
  if (!checkRateLimit(clientId)) return createErrorResponse("Too many requests", 429);

  const token = request.headers.get("x-hold-token");
  if (!token) return createErrorResponse("Hold token is required", 400);

  await prisma.appointmentHold.deleteMany({ where: { token: sanitizeString(token) } });
  logSecurityEvent("APPOINTMENT_HOLD_RELEASED", "INFO", { clientId });
  return addSecurityHeaders(new NextResponse(null, { status: 204 }));
}
