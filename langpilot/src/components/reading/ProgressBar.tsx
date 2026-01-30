
'use client';

interface ProgressBarProps {
  progress: number;
  timeSpent: number;
  wordsLearned: number;
}

export default function ProgressBar({ progress, timeSpent, wordsLearned }: ProgressBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-b-2 border-brown border-opacity-20 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-brown font-semibold">
              ⏱️ {formatTime(timeSpent)}
            </span>
            <span className="text-brown font-semibold">
              📚 {wordsLearned} words learned
            </span>
          </div>
          <span className="text-brown font-semibold text-sm">{progress}%</span>
        </div>
        <div className="w-full bg-cream rounded-full h-2">
          <div
            className="bg-orange rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
