-- Reserve each workshop timestamp across all services.
DROP INDEX "Appointment_serviceId_dateTime_key";
CREATE UNIQUE INDEX "Appointment_dateTime_key" ON "Appointment"("dateTime");
