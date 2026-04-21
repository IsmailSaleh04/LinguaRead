'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';
import { BookOpen } from 'lucide-react';
import { LANGUAGES } from '@/lib/utils/constants';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, nativeLanguage);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-light-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen size={48} className="text-orange" />
          </div>
          <h1 className="text-4xl font-bold justify-self-center text-dark mb-2">Create Account</h1>
          <p className="text-brown text-lg">Start your language learning journey</p>
        </div>

        <div className="bg-white border-2 border-brown border-opacity-20 rounded-xl p-8">
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-dark mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                         focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold text-dark mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                         focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold text-dark mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-brown rounded-lg text-dark font-semibold
                         focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
                placeholder="••••••••"
                required
              />
            </div>

            <Select
              label="Native Language"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              options={LANGUAGES.map(lang => ({
                value: lang.code,
                label: `${lang.flag} ${lang.name}`
              }))}
            />

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-brown mt-6 text-base">
            Already have an account?{' '}
            <Link href="/login" className="text-orange font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
