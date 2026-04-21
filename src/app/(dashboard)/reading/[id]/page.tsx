"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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

  const articleId = Number(params.id);

  useEffect(() => {
    if (Number.isNaN(articleId) || articleId <= 0) {
      router.push("/dashboard");
    }
  }, [articleId, router]);

  const [article, setArticle] = useState<Article | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  // Track the last progress percentage we sent to the server so we don't
  // fire redundant API calls while the scroll stays at the same multiple of 10.
  const lastReportedProgressRef = useRef<number>(-1);

  const {
    session,
    timeSpent,
    wordsLearned,
    startSession,
    updateProgress,
    completeSession,
    markWordLearned,
  } = useReadingSession(articleId);

  // Load article data — startSession is stable (defined once in the hook with
  // useCallback / no changing deps), so it's safe to list here.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [artRes, wordsRes] = await Promise.all([
          articlesApi.getArticle(articleId),
          articlesApi.getArticleWords(articleId),
        ]);
        if (cancelled) return;
        if (artRes.success && artRes.data) setArticle(artRes.data);
        if (wordsRes.success) setWords(wordsRes.data || []);
      } catch (err) {
        console.error("Failed to load article:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    startSession();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // Scroll progress — only reports to the server when the bucket changes
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = window.scrollY;
      const scrollHeight = contentRef.current.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const progress = Math.min(
        Math.round((scrollTop / scrollHeight) * 100),
        100,
      );
      setScrollProgress(progress);

      if (session) {
        const bucket = Math.floor(progress / 10) * 10; // 0, 10, 20 … 100
        if (bucket !== lastReportedProgressRef.current) {
          lastReportedProgressRef.current = bucket;
          updateProgress(progress);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session, updateProgress]);

  // Word interaction handlers
  const handleTranslate = async () => {
    if (!selectedWord || !user) return;
    setIsTranslating(true);
    setShowTranslation(true);
    try {
      const res = await translateApi.translate(
        selectedWord.text,
        currentLanguage,
        user.nativeLanguage || "en",
      );
      if (res.success && res.data) {
        setTranslation(res.data.translation);
        await vocabularyApi.updateWordStatus(
          selectedWord.id,
          selectedWord.user_status,
          "translate",
        );
        setWords((prev) =>
          prev.map((w) =>
            w.id === selectedWord.id && w.user_status === "unknown"
              ? { ...w, user_status: "learning" }
              : w,
          ),
        );
      }
    } catch (err) {
      setTranslation("Translation unavailable");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = () => {
    if (selectedWord)
      translateApi.speakText(selectedWord.text, currentLanguage);
  };

  const handleMarkKnown = async () => {
    if (!selectedWord) return;
    try {
      await vocabularyApi.updateWordStatus(selectedWord.id, "known", "mark");
      setWords((prev) =>
        prev.map((w) =>
          w.id === selectedWord.id ? { ...w, user_status: "known" } : w,
        ),
      );
      markWordLearned();
      setSelectedWord(null);
    } catch (err) {
      console.error(err);
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

  // Process HTML content to add word highlighting
  const processedContent = useMemo(() => {
    if (!article?.cached_content || !words.length) {
      return article?.cached_content || "";
    }

    const wordMap = new Map(
      words.map((w) => [w.text.toLowerCase().replace(/[^\w]/g, ""), w]),
    );

    const parser = new DOMParser();
    const doc = parser.parseFromString(article.cached_content, "text/html");

    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null,
    );

    const textNodesToProcess: { node: Text; parent: Node }[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      if (textNode.textContent?.trim() && textNode.parentNode) {
        const parentTag = (
          textNode.parentNode as Element
        ).tagName?.toLowerCase();
        if (parentTag !== "script" && parentTag !== "style") {
          textNodesToProcess.push({
            node: textNode,
            parent: textNode.parentNode,
          });
        }
      }
    }

    textNodesToProcess.forEach(({ node: textNode, parent }) => {
      const text = textNode.textContent!;
      const tokens = text.split(/(\b[\wà-ÿ'-]+\b)/gi);

      const fragment = doc.createDocumentFragment();

      tokens.forEach((token) => {
        if (!token.trim()) {
          fragment.appendChild(doc.createTextNode(token));
          return;
        }

        const clean = token.toLowerCase().replace(/[^\w]/g, "");
        const word = wordMap.get(clean);

        if (word) {
          const span = doc.createElement("span");
          span.textContent = token;
          span.className = `word-highlight cursor-pointer rounded px-1 transition-colors ${hoverClassForStatus(
            word.user_status,
          )}`;
          span.setAttribute("data-word-id", word.id.toString());
          span.setAttribute("data-word-text", word.text);
          span.setAttribute("data-word-status", word.user_status || "unknown");
          fragment.appendChild(span);
        } else {
          fragment.appendChild(doc.createTextNode(token));
        }
      });

      parent.replaceChild(fragment, textNode);
    });

    return doc.body.innerHTML;
  }, [article?.cached_content, words]);

  // Use a ref-based handler so the click handler never becomes stale and
  // doesn't need `words` in its dependency array (avoids re-attaching on
  // every word state update).
  const wordsRef = useRef<Word[]>(words);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const rawTarget = e.target as HTMLElement | null;
      const target = rawTarget?.closest(
        ".word-highlight",
      ) as HTMLElement | null;
      if (!target) return;

      e.stopPropagation();

      const wordIdAttr = target.getAttribute("data-word-id");
      const wordTextAttr = target.getAttribute("data-word-text") || "";
      const wordId = wordIdAttr ? Number(wordIdAttr) : null;

      // Read from ref — always current, no dependency needed
      const currentWords = wordsRef.current;

      const word =
        (wordId !== null && !Number.isNaN(wordId)
          ? currentWords.find((w) => w.id === wordId)
          : undefined) ||
        currentWords.find(
          (w) => w.text.toLowerCase() === wordTextAttr.toLowerCase(),
        );

      if (!word) return;

      const rect = target.getBoundingClientRect();
      // Account for scroll offset so tooltip stays anchored to the word
      setTooltipPosition({
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY,
      });
      setSelectedWord(word);
      setShowTranslation(false);
      setTranslation("");
      vocabularyApi.updateWordStatus(word.id, word.user_status, "expose");
    },
    [], // stable — reads words via ref
  );

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

  const minutesSpent = Math.max(1, Math.floor(timeSpent / 60));

  return (
    <>
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

      {/* Main Content Area */}
      <div className="max-w- mx-auto py-12">
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

        <div className="bg-cream rounded-lg p-8 mb-12">
          <div
            ref={contentRef}
            className="reading-text text-xl leading-loose text-dark"
            dangerouslySetInnerHTML={{ __html: processedContent }}
            onClick={handleContainerClick}
          />
        </div>

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

      {/* Tooltip — positioned in document space (scroll-aware) */}
      {selectedWord && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelectedWord(null)}
          />
          <div
            className="absolute z-50 bg-white rounded-xl border-2 border-brown p-6 max-w-sm shadow-2xl"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translate(-50%, -100%) translateY(-20px)",
            }}
          >
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

            {showTranslation && (
              <div className="mt-4 p-3 rounded-lg bg-cream border border-brown">
                {isTranslating ? (
                  <p className="text-brown italic">Translating…</p>
                ) : (
                  <p className="text-dark font-bold">{translation}</p>
                )}
              </div>
            )}

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
    </>
  );
}
