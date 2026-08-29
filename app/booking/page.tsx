"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

function BookingForm() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services");
        const data = await response.json();
        setServices(data);

        // If a service ID is provided in URL, select it
        if (serviceId) {
          const service = data.find((s: Service) => s.id === serviceId);
          if (service) {
            setSelectedService(service);
          }
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    }

    fetchServices();
  }, [serviceId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    async function fetchSlots() {
      setSlotsLoading(true);
      try {
        const response = await fetch(
          `/api/appointments/availability?serviceId=${selectedService?.id}&date=${selectedDate}`
        );
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        setSelectedTime("");
      } catch (err) {
        console.error("Error fetching slots:", err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchSlots();
  }, [selectedService, selectedDate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedService || !selectedDate || !selectedTime) {
      setError("Please select a service, date, and time");
      setLoading(false);
      return;
    }

    try {
      const dateTime = `${selectedDate}T${selectedTime}:00`;

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          dateTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      setSubmitted(true);
      setFormData({ customerName: "", customerEmail: "", customerPhone: "" });
      setSelectedService(null);
      setSelectedDate("");
      setSelectedTime("");

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="page-shell">
      <div className="booking-layout">
        <div className="booking-intro">
          <p className="eyebrow">Book the work</p>
          <h1>Reserve your<br /><em>repair time.</em></h1>
          <p>Choose the equipment service you need, then select a workshop time that suits your schedule.</p>
        </div>
        <div className="form-card">
        <h2>Appointment details</h2>

        {submitted && (
          <div className="form-message success">
            Appointment confirmed! We&apos;ll send you a confirmation email shortly.
          </div>
        )}

        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="site-form">
          {/* Service Selection */}
          <div>
            <label>
              Select a Service *
            </label>
            <select
              value={selectedService?.id || ""}
              onChange={(e) => {
                const service = services.find((s) => s.id === e.target.value);
                setSelectedService(service || null);
              }}
              required
              className="field"
            >
              <option value="">-- Select a service --</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label>
              Select a Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              required
              className="field"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && selectedService && (
            <div>
              <label>
                Select a Time *
              </label>
              {slotsLoading ? (
                <p className="field-note">Loading available times...</p>
              ) : availableSlots.length === 0 ? (
                <p className="field-note">
                  No available slots for this date. Please choose another date.
                </p>
              ) : (
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="field"
                >
                  <option value="">-- Select a time --</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Customer Information */}
          <div>
            <label>
              Your Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleFormChange}
              required
              className="field"
            />
          </div>

          <div>
            <label>
              Email *
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleFormChange}
              required
              className="field"
            />
          </div>

          <div>
            <label>
              Phone *
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleFormChange}
              required
              className="field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-submit"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
