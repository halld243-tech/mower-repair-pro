import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, getContactFormConfirmationEmail, getOwnerNotificationEmail } from "@/lib/email";
import {
  checkRateLimit,
  getClientId,
  validateRequired,
  validateEmail,
  validatePhone,
  validateName,
  sanitizeString,
  logSecurityEvent,
  createErrorResponse,
  addSecurityHeaders,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  
  if (!checkRateLimit(clientId)) {
    logSecurityEvent("RATE_LIMIT_EXCEEDED", "WARNING", { clientId, endpoint: "/api/contact" });
    return createErrorResponse("Too many requests", 429);
  }

  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Input validation - OWASP A03
    const validationError = validateRequired({ name, email, phone, message });
    if (validationError) return createErrorResponse(validationError, 400);
    if (!validateEmail(email)) return createErrorResponse("Invalid email address", 400);
    if (!validatePhone(phone)) return createErrorResponse("Invalid phone number", 400);
    if (!validateName(name)) return createErrorResponse("Invalid name", 400);

    // Get or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { 
          name: sanitizeString(name), 
          email: sanitizeString(email), 
          phone: sanitizeString(phone) 
        },
      });
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        customerId: customer.id,
        message: sanitizeString(message),
      },
    });

    // Send confirmation email to customer
    const customerEmailHtml = getContactFormConfirmationEmail(sanitizeString(name));
    await sendEmail({
      to: email,
      subject: "We've Received Your Message",
      html: customerEmailHtml,
    });

    // Send notification email to owner
    const ownerEmailHtml = getOwnerNotificationEmail(sanitizeString(name), sanitizeString(message));
    await sendEmail({
      to: process.env.OWNER_EMAIL || "owner@enginerepairpro.com",
      subject: "New Contact Form Submission",
      html: ownerEmailHtml,
    });

    logSecurityEvent("INQUIRY_CREATED", "INFO", { customerId: customer.id });
    
    const response = NextResponse.json(inquiry, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    logSecurityEvent("INQUIRY_ERROR", "ERROR", { error: String(error) });
    return createErrorResponse("Failed to submit inquiry", 500);
  }
}
