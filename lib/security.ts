import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// SECURITY MIDDLEWARE - OWASP A01: Authentication/Authorization
// ============================================================================

const API_KEY = process.env.API_KEY;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

// Simple in-memory rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function authenticateRequest(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  return Boolean(API_KEY) && apiKey === API_KEY;
}

export function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientId);

  if (!record || now > record.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export function getClientId(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// ============================================================================
// INPUT VALIDATION - OWASP A03: Injection Prevention
// ============================================================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  // Accept international format with + or 10+ digits
  const phoneRegex = /^(\+)?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

export function validateName(name: string): boolean {
  // Max 100 chars, letters/spaces/hyphens only
  return name.length > 0 && name.length <= 100 && /^[a-zA-Z\s\-']{1,100}$/.test(name);
}

export function validatePrice(price: unknown): boolean {
  if (typeof price !== "number" && typeof price !== "string") return false;
  const parsed = parseFloat(String(price));
  return !isNaN(parsed) && parsed > 0 && parsed < 10000;
}

export function validateDuration(duration: unknown): boolean {
  if (typeof duration !== "number" && typeof duration !== "string") return false;
  const parsed = parseInt(String(duration));
  return !isNaN(parsed) && parsed > 0 && parsed <= 480; // Max 8 hours
}

export function sanitizeString(input: string): string {
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>\"']/g, "") // Remove HTML chars
    .substring(0, 500); // Max 500 chars
}

export function validateRequired(fields: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${key} is required`;
    }
  }
  return null;
}

// ============================================================================
// ERROR HANDLING - OWASP A09: Secure Logging
// ============================================================================

export function logSecurityEvent(
  event: string,
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL",
  details: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    event,
    severity,
    ...details,
  }));
}

export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  logDetails?: Record<string, unknown>
): NextResponse {
  if (logDetails) {
    logSecurityEvent("API_ERROR", "WARNING", { message, statusCode, ...logDetails });
  }

  return NextResponse.json(
    { 
      error: message,
      // Never expose stack traces in production
      ...(process.env.NODE_ENV === "development" && logDetails && { debug: logDetails })
    },
    { status: statusCode }
  );
}

// ============================================================================
// SECURITY HEADERS - OWASP A05: Security Misconfiguration
// ============================================================================

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  // Strict Transport Security (HTTPS only)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

export const securityConfig = {
  maxBodySize: "5mb",
  requestTimeout: 30000, // 30 seconds
  apiKeyHeader: "x-api-key",
};
