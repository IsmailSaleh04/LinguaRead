'use client';

import Link from 'next/link';
import { estimateReadingTime, getCEFRColor } from '@/lib/utils/formatters';
import type { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/reading/${article.id}`}>
      <div className="bg-white rounded-xl p-6 shadow-md border-2 border-brown border-opacity-10 
                    hover:shadow-xl hover:border-opacity-30 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-dark flex-1 mr-4 hover:text-orange transition-colors">
            {article.title}
          </h3>
          {article.difficulty_score !== undefined && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
              style={{ 
                backgroundColor: getCEFRColor(
                  article.difficulty_score < 0.3 ? 'A1' :
                  article.difficulty_score < 0.4 ? 'A2' :
                  article.difficulty_score < 0.6 ? 'B1' :
                  article.difficulty_score < 0.8 ? 'B2' :
                  article.difficulty_score < 0.9 ? 'C1' : 'C2'
                )
              }}
            >
              {article.difficulty_score < 0.3 ? 'A1' :
               article.difficulty_score < 0.4 ? 'A2' :
               article.difficulty_score < 0.6 ? 'B1' :
               article.difficulty_score < 0.8 ? 'B2' :
               article.difficulty_score < 0.9 ? 'C1' : 'C2'}
            </span>
          )}
        </div>

        {article.summary && (
          <p className="text-brown mb-4 line-clamp-2">{article.summary}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-brown">
          {article.word_count && (
            <span>📖 {estimateReadingTime(article.word_count)}</span>
          )}
          {article.topics && article.topics.length > 0 && (
            <span className="flex items-center gap-1">
              🏷️ {article.topics.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
