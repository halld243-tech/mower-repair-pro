import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots, parseLocalDate } from "@/lib/utils";
import {
  checkRateLimit,
  getClientId,
  sanitizeString,
  logSecurityEvent,
  createErrorResponse,
  addSecurityHeaders,
} from "@/lib/security";

export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  
  if (!checkRateLimit(clientId)) {
    return createErrorResponse("Too many requests", 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    const serviceId = sanitizeString(searchParams.get("serviceId") || "");
    const date = sanitizeString(searchParams.get("date") || "");

    if (!serviceId || !date) {
      return createErrorResponse("Missing serviceId or date", 400);
    }

    // Verify service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return createErrorResponse("Service not found", 404);

    const selectedDate = parseLocalDate(date);
    if (!selectedDate) {
      return createErrorResponse("Invalid date format", 400);
    }

    // Get existing appointments for this date
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

    const availableSlots = getAvailableSlots(
      selectedDate,
      [...appointments, ...holds].map((appointment) => ({
        dateTime: appointment.dateTime,
        duration: appointment.service.duration,
      })),
      service.duration
    );

    logSecurityEvent("AVAILABILITY_CHECKED", "INFO", { serviceId });
    
    const response = NextResponse.json({ availableSlots });
    return addSecurityHeaders(response);
  } catch (error) {
    logSecurityEvent("AVAILABILITY_ERROR", "ERROR", { error: String(error) });
    return createErrorResponse("Failed to fetch availability", 500);
  }
}
