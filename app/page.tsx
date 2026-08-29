import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Small engine repair · local & reliable</p>
          <h1>Engine Repair<br /><em>done right.</em></h1>
          <p className="hero-copy">
            Straightforward repair and seasonal care for the mowers and equipment that keep your property moving.
          </p>
          <div className="hero-actions">
            <Link href="/booking" className="button button-primary">Book a repair</Link>
            <Link href="/services" className="button button-ghost">Explore services</Link>
          </div>
          <dl className="hero-facts" aria-label="Business highlights">
            <div><dt>Mon - Fri</dt><dd>9am - 5pm</dd></div>
            <div><dt>Service</dt><dd>All major brands</dd></div>
            <div><dt>Promise</dt><dd>Clear, honest work</dd></div>
          </dl>
        </div>
        <div className="engine-visual" aria-hidden="true">
          <p className="engine-visual-title">Small engine diagnostics</p>
          <div className="engine-block"><span className="spark-plug" /><span className="air-filter" /><span className="pull-start" /><span className="engine-bolt bolt-one" /><span className="engine-bolt bolt-two" /></div>
          <span className="engine-label label-spark">Spark</span>
          <span className="engine-label label-fuel">Fuel</span>
          <span className="engine-label label-air">Air</span>
          <span className="engine-label label-blade">Blade drive</span>
        </div>
      </section>

      <section className="service-section">
        <div className="section-heading">
          <p className="eyebrow">What we keep running</p>
          <h2>Workshop care for<br />working equipment.</h2>
          <Link href="/services" className="text-link">See every service <span aria-hidden="true">→</span></Link>
        </div>
        <div className="service-grid">
          <article className="service-feature service-feature-mower">
            <span className="service-number">01</span>
            <h3>Mower repair</h3>
            <p>Diagnostics, blade work, belts, carburetors, and dependable tune-ups.</p>
          </article>
          <article className="service-feature service-feature-engine">
            <span className="service-number">02</span>
            <h3>Seasonal tune-ups</h3>
            <p>Fresh-start maintenance before the work season begins.</p>
          </article>
          <article className="service-feature service-feature-urgent">
            <span className="service-number">03</span>
            <h3>Priority repairs</h3>
            <p>When downtime gets in the way, we focus on getting you moving again.</p>
          </article>
        </div>
      </section>

      <section className="process-section">
        <div>
          <p className="eyebrow">No guesswork</p>
          <h2>Bring it in.<br />We&apos;ll handle the rest.</h2>
        </div>
        <ol className="process-list">
          <li><span>01</span><div><h3>Tell us what&apos;s wrong</h3><p>Choose a service and a time that works for you.</p></div></li>
          <li><span>02</span><div><h3>Get a clear diagnosis</h3><p>We explain the work before we get started.</p></div></li>
          <li><span>03</span><div><h3>Get back to work</h3><p>Pick up equipment that&apos;s ready for the next job.</p></div></li>
        </ol>
      </section>

      <section className="booking-banner">
        <p className="eyebrow">Ready when you are</p>
        <h2>Let&apos;s get your equipment<br />back in the game.</h2>
        <Link href="/booking" className="button button-primary">Schedule service</Link>
      </section>
    </div>
  );
}
