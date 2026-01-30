import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 20,
    md: 40,
    lg: 60,
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 size={sizes[size]} className="animate-spin text-orange" />
    </div>
  );
}