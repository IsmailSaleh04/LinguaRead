import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="text-red-500" />
        <p className="text-red-700 font-semibold">{message}</p>
      </div>
    </div>
  );
}
