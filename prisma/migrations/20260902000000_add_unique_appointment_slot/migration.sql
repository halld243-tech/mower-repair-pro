-- Prevent duplicate bookings for the same service and time.
CREATE UNIQUE INDEX "Appointment_serviceId_dateTime_key" ON "Appointment"("serviceId", "dateTime");
