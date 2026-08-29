import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateRequest,
  checkRateLimit,
  getClientId,
  validateRequired,
  validatePrice,
  validateDuration,
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
    const categoryId = searchParams.get("categoryId");

    let services;
    if (categoryId) {
      services = await prisma.service.findMany({
        where: { categoryId: sanitizeString(categoryId) },
        include: { category: true },
      });
    } else {
      services = await prisma.service.findMany({
        include: { category: true },
      });
    }

    const response = NextResponse.json(services);
    return addSecurityHeaders(response);
  } catch (error) {
    logSecurityEvent("API_ERROR", "ERROR", { endpoint: "/api/services", error: String(error) });
    return createErrorResponse("Failed to fetch services", 500);
  }
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  
  if (!authenticateRequest(request)) {
    logSecurityEvent("UNAUTHORIZED", "CRITICAL", { clientId, endpoint: "/api/services" });
    return createErrorResponse("Unauthorized", 401);
  }

  if (!checkRateLimit(clientId)) {
    return createErrorResponse("Too many requests", 429);
  }

  try {
    const body = await request.json();
    const { name, description, price, durationMinutes, categoryId } = body;

    const validationError = validateRequired({ name, description, price, durationMinutes });
    if (validationError) return createErrorResponse(validationError, 400);
    if (!validatePrice(price)) return createErrorResponse("Invalid price (0-10000)", 400);
    if (!validateDuration(durationMinutes)) return createErrorResponse("Invalid duration (1-480 min)", 400);

    const service = await prisma.service.create({
      data: {
        name: sanitizeString(name),
        description: sanitizeString(description),
        price: parseFloat(price),
        duration: parseInt(durationMinutes),
        categoryId: categoryId || "general",
      },
      include: { category: true },
    });

    logSecurityEvent("SERVICE_CREATED", "INFO", { serviceId: service.id });
    const response = NextResponse.json(service, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    logSecurityEvent("SERVICE_ERROR", "ERROR", { error: String(error) });
    return createErrorResponse("Failed to create service", 500);
  }
}
