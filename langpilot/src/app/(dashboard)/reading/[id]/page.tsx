"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { articlesApi } from "@/lib/api/articles";
import { vocabularyApi } from "@/lib/api/vocabulary";
import { translateApi } from "@/lib/api/translate";
import { useReadingSession } from "@/lib/hooks/useReadingSession";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/Button";
import { estimateReadingTime } from "@/lib/utils/formatters";
import {
  Clock,
  BookOpen,
  CheckCircle,
  X,
  Volume2,
  Languages,
  Check,
} from "lucide-react";
import type { Article, Word } from "@/lib/types";

export default function ReadingViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const articleId = parseInt(params.id as string);

  const [article, setArticle] = useState<Article | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Tooltip states
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const paragraphs = (article?.cached_content || '').split(/\n\s*\n/);

  const {
    session,
    timeSpent,
    wordsLearned,
    startSession,
    updateProgress,
    completeSession,
    markWordLearned,
  } = useReadingSession(articleId);

  /* ---------------------------------------------
     Lifecycle
  ---------------------------------------------- */
  useEffect(() => {
    loadArticle();
    startSession();
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollTop = window.scrollY;
      const scrollHeight = contentRef.current.scrollHeight - window.innerHeight;

      const progress = Math.min(
        Math.round((scrollTop / scrollHeight) * 100),
        100,
      );

      setScrollProgress(progress);

      if (session && progress % 10 === 0) {
        updateProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

  /* ---------------------------------------------
     Data
  ---------------------------------------------- */
  const loadArticle = async () => {
    try {
      const [articleRes, wordsRes] = await Promise.all([
        articlesApi.getArticle(articleId),
        articlesApi.getArticleWords(articleId),
      ]);

      if (articleRes.success) setArticle(articleRes.data || null);
      if (wordsRes.success) setWords(wordsRes.data || []);
    } catch (err) {
      console.error("Failed to load article:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------
     UI helpers
  ---------------------------------------------- */
  const minutesSpent = Math.max(1, Math.floor(timeSpent / 60));

  /* ---------------------------------------------
     Word Interactions
  ---------------------------------------------- */
  const handleWordClick = (e: React.MouseEvent, word: Word) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setSelectedWord(word);
    setShowTranslation(false);
    setTranslation('');

    // Track exposure
    vocabularyApi.updateWordStatus(word.id, word.user_status, 'expose');
  };

  const handleTranslate = async () => {
    if (!selectedWord || !user) return;
    
    setIsTranslating(true);
    setShowTranslation(true);
    
    try {
      const response = await translateApi.translate(
        selectedWord.text, 
        currentLanguage, 
        user.nativeLanguage || 'en'
      );
      
      if (response.success && response.data) {
        setTranslation(response.data.translation);
        
        // Track translation click - auto-progresses unknown -> learning
        await vocabularyApi.updateWordStatus(selectedWord.id, selectedWord.user_status, 'translate');
        
        // Update local state
        setWords(words.map(w => 
          w.id === selectedWord.id 
            ? { ...w, user_status: w.user_status === 'unknown' ? 'learning' : w.user_status }
            : w
        ));
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslation('Translation unavailable');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = () => {
    if (!selectedWord) return;
    translateApi.speakText(selectedWord.text, currentLanguage);
  };

  const handleMarkKnown = async () => {
    if (!selectedWord) return;
    
    try {
      await vocabularyApi.updateWordStatus(selectedWord.id, 'known', 'mark');
      
      // Update local state
      setWords(words.map(w => 
        w.id === selectedWord.id 
          ? { ...w, user_status: 'known' }
          : w
      ));
      
      markWordLearned();
      setSelectedWord(null);
    } catch (error) {
      console.error('Failed to mark word as known:', error);
    }
  };

  const hoverClassForStatus = (status?: Word["user_status"]) => {
    switch (status) {
      case "known":
        return "hover:bg-green-200";
      case "learning":
        return "hover:bg-yellow-200";
      default:
        return "hover:bg-red-200";
    }
  };

  const highlightText = (text: string) => {
    if (!text) return null;

    const wordMap = new Map(words.map((w) => [w.text.toLowerCase(), w]));
    
    const tokens = text.split(/(\s+)/);

    return tokens.map((token, index) => {
      const clean = token.toLowerCase().replace(/[^\w]/g, "");
      const word = wordMap.get(clean);

      if (!word) return <span key={index}>{token}</span>;

      return (
        <span
          key={index}
          onClick={(e) => handleWordClick(e, word)}
          className={`cursor-pointer rounded px-1 transition-colors ${hoverClassForStatus(
            word.user_status,
          )}`}
        >
          {token}
        </span>
      );
    });
  };

  /* ---------------------------------------------
     Render guards
  ---------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-brown font-bold">Article not found</p>
      </div>
    );
  }

  /* ---------------------------------------------
     Render
  ---------------------------------------------- */
return (
  <div>
    {/* Progress Bar */}
    <div className="bg-white border-b-2 border-brown border-opacity-20 px-6 py-4 sticky top-20 z-40 -mx-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-brown font-bold">
            <Clock size={20} />
            <span>{minutesSpent} min</span>
          </div>
          <div className="flex items-center gap-2 text-brown font-bold">
            <BookOpen size={20} />
            <span>{wordsLearned} words learned</span>
          </div>
        </div>
        <span className="text-brown font-bold">{scrollProgress}%</span>
      </div>

      <div className="w-full bg-brown bg-opacity-20 rounded-full h-3">
        <div
          className="bg-orange rounded-full h-3 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>

    <div ref={contentRef} className="max-w- mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-dark mb-6 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-6 text-brown text-lg font-bold">
          {article.word_count && (
            <span className="flex items-center gap-2">
              <Clock size={20} />
              {estimateReadingTime(article.word_count)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream rounded-lg p-8 mb-12">
        <div className="reading-text text-xl leading-loose text-dark">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="indent-6 mb-4">
              {highlightText(paragraph)}
            </p>
          ))}
        </div>
      </div>

      {/* Complete */}
      <div className="mt-12 flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={async () => {
            await completeSession();
            router.push("/dashboard");
          }}
        >
          <CheckCircle size={24} />
          Mark as Complete
        </Button>
      </div>
    </div>

    {/* Tooltip */}
    {selectedWord && (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedWord(null)}
        />

        <div
          className="fixed z-50 bg-white rounded-xl border-2 border-brown p-6 max-w-sm shadow-2xl"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translate(-50%, -100%) translateY(-20px)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold text-dark">
                {selectedWord.text}
              </h3>
              <p className="mt-2 text-brown font-bold capitalize">
                {selectedWord.user_status ?? "unknown"}
              </p>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              className="text-brown hover:text-dark"
            >
              <X size={24} />
            </button>
          </div>

          {/* Translation */}
          {showTranslation && (
            <div className="mt-4 p-3 rounded-lg bg-cream border border-brown">
              {isTranslating ? (
                <p className="text-brown italic">Translating…</p>
              ) : (
                <p className="text-dark font-bold">{translation}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSpeak}
              className="p-3 rounded-full border border-brown hover:bg-brown/10"
              title="Read aloud"
            >
              <Volume2 size={20} />
            </button>

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="p-3 rounded-full border border-brown hover:bg-brown/10"
              title="Translate"
            >
              <Languages size={20} />
            </button>

            {selectedWord.user_status !== "known" && (
              <button
                onClick={handleMarkKnown}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Check size={18} />
                Known
              </button>
            )}
          </div>
        </div>
      </>
    )}
  </div>
);

}
