// Appointment availability calculation utilities

const BUSINESS_HOURS_START = 9; // 9 AM
const BUSINESS_HOURS_END = 17; // 5 PM
const SLOT_DURATION_MINUTES = 30;
const CLOSED_DAYS = [0, 6]; // 0 = Sunday, 6 = Saturday

/**
 * Get available time slots for a given date
 * @param date - The date to check availability for
 * @param serviceId - The service ID to check appointments for
 * @param existingAppointments - Array of existing appointment times
 * @returns Array of available time slots
 */
export function getAvailableSlots(
  date: Date,
  existingAppointments: Date[] = [],
  appointmentDurationMinutes: number = SLOT_DURATION_MINUTES
) {
  const dayOfWeek = date.getDay();

  // Check if day is closed
  if (CLOSED_DAYS.includes(dayOfWeek)) {
    return [];
  }

  const slots: string[] = [];
  const dateStr = date.toISOString().split("T")[0];

  // Generate time slots for the day
  for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const slotDateTime = new Date(`${dateStr}T${timeStr}:00`);
      const slotEndTime = new Date(slotDateTime.getTime() + appointmentDurationMinutes * 60 * 1000);
      const businessDayEnd = new Date(`${dateStr}T${BUSINESS_HOURS_END.toString().padStart(2, "0")}:00:00`);

      if (slotEndTime > businessDayEnd) {
        continue;
      }

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((apt) => {
        const appointmentEndTime = new Date(apt.getTime() + appointmentDurationMinutes * 60 * 1000);
        return slotDateTime < appointmentEndTime && slotEndTime > apt;
      });

      if (!hasConflict) {
        slots.push(timeStr);
      }
    }
  }

  return slots;
}

export function parseLocalDate(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
    ? parsedDate
    : null;
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date) {
  return date < new Date();
}
