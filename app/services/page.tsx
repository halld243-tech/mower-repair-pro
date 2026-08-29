"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/ServiceCard";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services");
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">The workshop</p>
        <h1>Care that keeps<br /><em>work moving.</em></h1>
        <p>
          We offer comprehensive lawn mower and small engine repair services
        </p>

        {loading ? (
          <div className="empty-state">
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>
              No services available yet. Check back soon!
            </p>
            <p>
              In the meantime, please <a href="/contact">contact us</a> for inquiries.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
