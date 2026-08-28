import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-400">🌿 Mower Repair Pro</h1>
          <div className="space-x-3">
            <Link to="/login" className="text-sm hover:text-green-400">Login</Link>
            <Link to="/register" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium">Sign Up</Link>
          </div>
        </div>
      </header>

      <section className="bg-green-700 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Expert Lawn Mower Repair</h2>
          <p className="text-xl mb-8 text-green-100">Professional service for all makes and models. Fast turnaround, fair prices, and quality craftsmanship.</p>
          <Link to="/register" className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors">
            Request a Repair →
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Services</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔧', title: 'Engine Repair', desc: 'Complete engine diagnostics, tune-ups, and rebuilds for all mower types.' },
            { icon: '🔪', title: 'Blade Sharpening', desc: 'Professional blade sharpening and balancing for a clean, healthy cut.' },
            { icon: '⚙️', title: 'General Maintenance', desc: 'Oil changes, filter replacements, belt adjustments, and seasonal prep.' },
            { icon: '🔋', title: 'Electrical Systems', desc: 'Starter motor, ignition, and battery system repairs and replacements.' },
            { icon: '🛞', title: 'Drive & Transmission', desc: 'Self-propel systems, hydrostatic drives, and transmission overhauls.' },
            { icon: '📋', title: 'Full Inspections', desc: 'Comprehensive multi-point inspections with detailed written reports.' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{s.icon}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{s.title}</h4>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account' },
              { step: '2', title: 'Register Mower', desc: 'Add your mower details' },
              { step: '3', title: 'Submit Request', desc: 'Describe the issue' },
              { step: '4', title: 'Track & Pay', desc: 'Follow progress online' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">{s.step}</div>
                <h4 className="font-semibold text-gray-800">{s.title}</h4>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        <p>© 2024 Mower Repair Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
