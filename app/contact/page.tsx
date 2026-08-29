"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Reach the workshop</p>
        <h1>Let&apos;s solve<br /><em>the problem.</em></h1>
        <p>
          Have a question? Get in touch with us today.
        </p>

        <div className="contact-grid">
          <aside className="contact-details">
              <h2>Contact information</h2>
              <div className="contact-list">
                <div>
                  <p>Phone</p><a href="tel:+15551234567">(555) 123-4567</a>
                </div>
                <div>
                  <p>Email</p><a href="mailto:info@enginerepairpro.com">info@enginerepairpro.com</a>
                </div>
                <div>
                  <p>Hours</p><span>Monday - Friday: 9AM - 5PM<br />Saturday - Sunday: Closed</span>
                </div>
              </div>
          </aside>

          <div className="form-card">
            <h2>Send a message</h2>

            {submitted && (
              <div className="form-message success">
                Thank you! We've received your message and will get back to you soon.
              </div>
            )}

            {error && (
              <div className="form-message error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="site-form">
              <div>
                <label>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="field"
                />
              </div>

              <div>
                <label>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="form-submit"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
