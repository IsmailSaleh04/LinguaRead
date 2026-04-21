import Link from 'next/link';
import { BookOpen, Shield } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
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
          <Shield size={48} className="text-orange" />
          <h1 className="text-5xl font-bold text-dark">Privacy Policy</h1>
        </div>
        
        <p className="text-brown text-lg mb-8">Last Updated: January 31, 2025</p>

        <div className="space-y-8 text-lg text-brown leading-relaxed">
          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Account information (email, password)</li>
              <li>Language learning preferences and proficiency levels</li>
              <li>Reading history and vocabulary data</li>
              <li>Progress and usage statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Track your progress and vocabulary growth</li>
              <li>Send you updates and educational content</li>
              <li>Respond to your requests and support inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">3. Data Storage and Security</h2>
            <p className="mb-4">
              We store your data securely using industry-standard encryption. Your password is hashed 
              and never stored in plain text. We use secure servers and follow best practices to protect 
              your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">4. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Access your personal data</li>
              <li>Request corrections to your data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in a readable format</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">5. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember your preferences, 
              and analyze how you use our service. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">6. Third-Party Services</h2>
            <p className="mb-4">
              We use third-party services for translation (LibreTranslate/Google Translate) and 
              content delivery (Wikipedia). These services have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">7. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-dark mb-4">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@linguaread.com" className="text-orange font-bold hover:underline">
                privacy@linguaread.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
