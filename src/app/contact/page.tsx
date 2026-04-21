'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Send, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 3000);
  };

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

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <MessageSquare size={56} className="text-orange mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-dark mb-4">Contact Us</h1>
          <p className="text-xl text-brown">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white border-2 border-brown border-opacity-20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-dark mb-6">Send us a message</h2>
            
            {submitted ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                <p className="text-green-700 font-bold text-lg mb-2">Message Sent!</p>
                <p className="text-green-600">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-dark mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                             focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-dark mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                             focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-dark mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                             focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
                    placeholder="How can we help?"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  <Send size={20} />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-cream border-2 border-brown border-opacity-20 rounded-xl p-8">
              <Mail size={32} className="text-orange mb-4" />
              <h3 className="text-xl font-bold text-dark mb-2">Email Us</h3>
              <p className="text-brown font-semibold mb-4">
                For general inquiries and support
              </p>
              <a
                href="mailto:support@linguaread.com"
                className="text-orange font-bold hover:underline text-lg"
              >
                support@linguaread.com
              </a>
            </div>

            <div className="bg-cream border-2 border-brown border-opacity-20 rounded-xl p-8">
              <MessageSquare size={32} className="text-orange mb-4" />
              <h3 className="text-xl font-bold text-dark mb-2">Response Time</h3>
              <p className="text-brown font-semibold">
                We typically respond within 24 hours during business days.
              </p>
            </div>

            <div className="bg-cream border-2 border-brown border-opacity-20 rounded-xl p-8">
              <h3 className="text-xl font-bold text-dark mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                <p className="text-brown font-semibold">
                  <span className="font-bold text-dark">Support:</span>{' '}
                  <a href="mailto:support@linguaread.com" className="text-orange hover:underline">
                    support@linguaread.com
                  </a>
                </p>
                <p className="text-brown font-semibold">
                  <span className="font-bold text-dark">Business:</span>{' '}
                  <a href="mailto:business@linguaread.com" className="text-orange hover:underline">
                    business@linguaread.com
                  </a>
                </p>
                <p className="text-brown font-semibold">
                  <span className="font-bold text-dark">Press:</span>{' '}
                  <a href="mailto:press@linguaread.com" className="text-orange hover:underline">
                    press@linguaread.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
