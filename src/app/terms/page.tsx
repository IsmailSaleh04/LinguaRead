import Link from 'next/link';
import { BookOpen, FileText } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b-2 border-brown border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <BookOpen size={32} className="text-orange" />
            <span className="text-2xl font-bold text-dark">LinguaRead</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <FileText size={48} className="text-orange" />
          <h1 className="text-5xl font-bold text-dark">Terms of Service</h1>
        </div>
        
        <p className="text-brown text-lg mb-8">Last Updated: January 31, 2025</p>

        <div className="space-y-8 text-lg text-brown leading-relaxed">
          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using LinguaRead, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">2. Description of Service</h2>
            <p>
              LinguaRead provides a language learning platform that allows users to read articles, 
              track vocabulary, and monitor their progress. We source content from Wikipedia and 
              other public sources under their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">3. User Accounts</h2>
            <p className="mb-4">To use LinguaRead, you must:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Be at least 13 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated systems to access the service (bots, scrapers)</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">5. Intellectual Property</h2>
            <p>
              The LinguaRead platform, including its design, features, and functionality, is owned by 
              LinguaRead and protected by copyright and other intellectual property laws. Articles and 
              content are sourced from Wikipedia under the Creative Commons license.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">6. User Data</h2>
            <p>
              You retain all rights to your personal data. By using LinguaRead, you grant us permission 
              to use your data to provide and improve the service as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms. 
              You may delete your account at any time through the settings page.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">8. Disclaimer</h2>
            <p>
              LinguaRead is provided "as is" without warranties of any kind. We do not guarantee that 
              the service will be uninterrupted or error-free. We are not responsible for the accuracy 
              of translations or content from third-party sources.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">9. Limitation of Liability</h2>
            <p>
              LinguaRead shall not be liable for any indirect, incidental, special, or consequential 
              damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@linguaread.com" className="text-orange font-bold hover:underline">
                legal@linguaread.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
