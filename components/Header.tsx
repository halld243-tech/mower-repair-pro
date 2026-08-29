"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">ER</span>
          <span>Engine Repair <b>Pro</b></span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/services">
              Services
            </Link>
          </li>
          <li>
            <Link href="/booking">
              Book Appointment
            </Link>
          </li>
          <li>
            <Link href="/blog">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/contact">
              Contact
            </Link>
          </li>
        </ul>
        <Link href="/booking" className="nav-cta">Book now</Link>
      </nav>
    </header>
  );
}
