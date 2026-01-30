'use client';

import TopNav from '@/components/layout/TopNav';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <TopNav />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}