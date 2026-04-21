'use client';

import { WORD_STATUS } from '@/lib/utils/constants';

interface WordStatusBadgeProps {
  status: 'unknown' | 'learning' | 'known';
}

export default function WordStatusBadge({ status }: WordStatusBadgeProps) {
  const statusInfo = WORD_STATUS[status];
  
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: statusInfo.color }}
    >
      {statusInfo.label}
    </span>
  );
}
