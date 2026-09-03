-- Track temporary reservations separately from confirmed customer appointments.
CREATE TABLE "AppointmentHold" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentHold_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppointmentHold_token_key" ON "AppointmentHold"("token");
CREATE UNIQUE INDEX "AppointmentHold_dateTime_key" ON "AppointmentHold"("dateTime");
CREATE INDEX "AppointmentHold_expiresAt_idx" ON "AppointmentHold"("expiresAt");

ALTER TABLE "AppointmentHold" ADD CONSTRAINT "AppointmentHold_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
