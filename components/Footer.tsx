"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <p className="footer-kicker">Engine Repair Pro</p>
            <h3>Built for the work<br />ahead.</h3>
            <p>
              Professional small engine repair services for lawns and landscaping equipment.
            </p>
          </div>
          <div>
            <h3 className="footer-label">Workshop hours</h3>
            <ul>
              <li>Monday - Friday: 9AM - 5PM</li>
              <li>Saturday: Closed</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
          <div>
            <h3 className="footer-label">Contact</h3>
            <ul>
              <li><a href="tel:+15551234567">(555) 123-4567</a></li>
              <li><a href="mailto:info@enginerepairpro.com">info@enginerepairpro.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom"><p>© {currentYear} Engine Repair Pro</p><p>Small engine service, plainly done.</p></div>
      </div>
    </footer>
  );
}
