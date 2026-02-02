// ==========================================
// WIKIPEDIA-STYLED READING PAGE
// src/app/(dashboard)/reading/[id]/page.tsx
// ==========================================
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
  const [article, setArticle] = useState<Article | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection states
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [tooltipLocked, setTooltipLocked] = useState(false);


  const contentRef = useRef<HTMLDivElement>(null);

  const {
    session,
    timeSpent,
    wordsLearned,
    startSession,
    updateProgress,
    completeSession,
    markWordLearned,
  } = useReadingSession(articleId);

  // Load article
  useEffect(() => {
    const load = async () => {
      try {
        const [artRes, wordsRes] = await Promise.all([
          articlesApi.getArticle(articleId),
          articlesApi.getArticleWords(articleId),
        ]);

        if (artRes.success) setArticle(artRes.data || null);
        if (wordsRes.success) setWords(wordsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    startSession();
  }, [articleId]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = window.scrollY;
      const scrollHeight = contentRef.current.scrollHeight - window.innerHeight;
      const progress = Math.min(
        Math.round((scrollTop / scrollHeight) * 100),
        100,
      );
      if (session && progress % 10 === 0) updateProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

  // Wrap words and handle selection
  useEffect(() => {
    if (!contentRef.current || !words.length || isLoading) return;

    const wordMap = new Map(words.map((w) => [w.text.toLowerCase(), w]));

    // Process all text nodes
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script/style/noscript tags
          const parent = node.parentElement?.tagName.toLowerCase();
          if (
            parent === "script" ||
            parent === "style" ||
            parent === "noscript"
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.textContent?.trim()
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      },
    );

    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      nodes.push(node as Text);
    }

    nodes.forEach((textNode) => {
      if (!textNode.parentNode) return;
      const text = textNode.textContent!;
      const fragment = document.createDocumentFragment();

      // Better tokenization - preserves punctuation
      const tokens = text.split(/(\b[a-zà-ÿ'-]+\b)/gi);

      tokens.forEach((token) => {
        if (!token) return;

        const cleanToken = token.toLowerCase().replace(/[^\w]/g, "");
        const word = wordMap.get(cleanToken);

        if (word) {
          const span = document.createElement("span");
          span.textContent = token;
          span.className = `word-highlight word-${word.user_status || "unknown"}`;
          span.dataset.wordId = String(word.id);
span.addEventListener("click", (e) => {
  e.stopPropagation();

  document
    .querySelectorAll(".word-active")
    .forEach((el) => el.classList.remove("word-active"));

  span.classList.add("word-active");

  const rect = span.getBoundingClientRect();
  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  setSelectedWord(word);
  setSelectedText("");
  setShowTranslation(false);
  setTranslation("");
});

          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(token));
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    // Multi-word selection
    const handleSelection = () => {
      const sel = window.getSelection();
      if (
        !sel ||
        sel.isCollapsed ||
        !contentRef.current?.contains(sel.anchorNode) || tooltipLocked
      ) {
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 2 || text.split(/\s+/).length > 10) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
      setSelectedText(text);
      setSelectedWord(null);
      setShowTranslation(false);
      setTranslation("");
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [article, words, isLoading]);

  // Translation
const handleTranslate = async () => {
  const text = selectedText || selectedWord?.text;
  if (!text || !user) return;

  setTooltipLocked(true);
  setIsTranslating(true);
  setShowTranslation(true);

  try {
    const res = await translateApi.translate(
      text,
      currentLanguage,
      user.nativeLanguage || "en",
    );

    if (res.success && res.data) {
      setTranslation(res.data.translation);
    }
  } finally {
    setIsTranslating(false);
    setTooltipLocked(false);
  }
};


const handleSpeak = () => {
  const text = selectedText || selectedWord?.text;
  if (!text) return;

  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech not supported in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLanguage || "en";

  window.speechSynthesis.cancel(); // stop previous
  window.speechSynthesis.speak(utterance);
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
      setSelectedText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-20 text-xl">Article not found</div>;
  }

  const minutes = Math.max(1, Math.floor(timeSpent / 60));

  return (
    <>
      <style jsx global>{`
        /* Wikipedia-like styling */
        .wiki-container {
          background: #ffffff;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          color: #202122;
          line-height: 1.6;
        }

        /* Prevent interaction with images and figures */
        .wiki-content figure,
        .wiki-content img,
        .wiki-content .thumb,
        .wiki-content .infobox img {
          pointer-events: none; /* blocks all mouse events */
          user-select: none; /* prevents text/image selection */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        /* Extra strong protection against right-click / drag */
        .wiki-content figure,
        .wiki-content img {
          -webkit-touch-callout: none; /* iOS */
        }

        /* Optional: visual hint that images are locked (very subtle) */
        .wiki-content figure::after {
          content: " ";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .wiki-content {
          font-size: 14px;
          line-height: 1.6;
          color: #202122;
        }

        .wiki-content h1 {
          font-family: "Linux Libertine", Georgia, Times, serif;
          font-size: 2em;
          font-weight: normal;
          line-height: 1.3;
          margin: 0 0 0.25em 0;
          padding: 0;
          border: 0;
          color: #000;
        }

        .wiki-content h2 {
          font-family: "Linux Libertine", Georgia, Times, serif;
          font-size: 1.5em;
          font-weight: normal;
          margin: 1em 0 0.25em 0;
          padding-bottom: 0.17em;
          border-bottom: 1px solid #a2a9b1;
          color: #000;
        }

        .wiki-content h3 {
          font-family: "Linux Libertine", Georgia, Times, serif;
          font-size: 1.2em;
          font-weight: bold;
          margin: 0.3em 0 0 0;
          color: #000;
        }

        .wiki-content p {
          margin: 0.5em 0;
          line-height: 1.6;
        }

        .wiki-content a {
          color: #0645ad;
          text-decoration: none;
        }

        .wiki-content a:hover {
          text-decoration: underline;
        }

        .wiki-content ul,
        .wiki-content ol {
          margin: 0.3em 0 0 1.6em;
          padding: 0;
        }

        .wiki-content li {
          margin-bottom: 0.1em;
        }

        /* Tables */
        .wiki-content table {
          margin: 1em 0;
          background: #f8f9fa;
          border: 1px solid #a2a9b1;
          border-collapse: collapse;
        }

        .wiki-content th {
          background: #eaecf0;
          text-align: center;
          font-weight: bold;
          padding: 0.4em;
          border: 1px solid #a2a9b1;
        }

        .wiki-content td {
          padding: 0.4em;
          border: 1px solid #a2a9b1;
        }

        /* Infoboxes */
        .wiki-content .infobox {
          float: right;
          clear: right;
          width: 22em;
          margin: 0 0 1em 1em;
          background: #f8f9fa;
          border: 1px solid #a2a9b1;
          padding: 0.2em;
          font-size: 88%;
          line-height: 1.5em;
        }

        .wiki-content .infobox th {
          background: #eaecf0;
          text-align: center;
          font-weight: bold;
        }

        /* Images and figures */
        .wiki-content figure,
        .wiki-content .thumb {
          display: inline-block;
          width: auto;
          max-width: fit-content;
          margin: 0.5em 0;
          background: #f8f9fa;
          border: 1px solid #c8ccd1;
          padding: 3px;
          float: right;
        }

        .wiki-content figure.mw-halign-right,
        .wiki-content .thumbright {
          float: right;
          clear: right;
          margin: 0.5em 0 1.3em 1.4em;
          max-width: 300px;
        }

        .wiki-content figure.mw-halign-left,
        .wiki-content .thumbleft {
          float: left;
          clear: left;
          margin: 0.5em 1.4em 1.3em 0;
          max-width: 300px;
        }

        .wiki-content figure.mw-halign-center,
        .wiki-content .thumbcenter {
          margin: 0.5em auto;
          display: block;
        }

        .wiki-content figure img,
        .wiki-content .thumb img {
          display: block;
          max-width: 100%;
          height: auto;
          background: #fff;
        }

        .wiki-content figure > img,
        .wiki-content figure > a > img {
          display: block;
          max-width: 100%;
        }

        .wiki-content figcaption,
        .wiki-content .thumbcaption {
          width: 0;
          min-width: 100%;
          white-space: normal;
          font-size: 94%;
          line-height: 1.4em;
          padding: 3px;
          color: #54595d;
          text-align: left;
          overflow-wrap: break-word;
        }

        /* References */
        .wiki-content .reference {
          font-size: 80%;
          vertical-align: super;
          line-height: 1;
        }

        /* Blockquotes */
        .wiki-content blockquote {
          margin: 1em 2em;
          padding: 0.5em 1em;
          border-left: 4px solid #eaecf0;
          background: #f8f9fa;
          font-style: italic;
        }

        /* Word highlighting */
        .word-highlight {
          cursor: pointer;
          border-radius: 2px;
          padding: 0 1px;
          transition: background-color 0.15s ease;
        }

        /* DEFAULT: invisible */
        .word-unknown,
        .word-learning,
        .word-known {
          background-color: transparent;
        }

        /* HOVER STATES */
        .word-unknown:hover {
          background-color: rgba(239, 68, 68, 0.25);
        }

        .word-learning:hover {
          background-color: rgba(255, 131, 3, 0.25);
        }

        .word-known:hover {
          background-color: rgba(34, 197, 94, 0.15);
        }

        /* ACTIVE (clicked word) */
        .word-active.word-unknown {
          background-color: rgba(239, 68, 68, 0.35);
        }

        .word-active.word-learning {
          background-color: rgba(255, 131, 3, 0.35);
        }

        .word-active.word-known {
          background-color: rgba(34, 197, 94, 0.25);
        }
        /* Tooltip */
        .reading-tooltip {
          position: fixed;
          z-index: 9999;
          transform: translate(-50%, calc(-100% - 15px));
          pointer-events: all;
          background: white;
          border: 1px solid #a2a9b1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 12px;
          min-width: 280px;
          max-width: 400px;
        }

        .reading-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 8px solid transparent;
          border-top-color: white;
        }

        /* Clear floats */
        .wiki-content h2,
        .wiki-content h3 {
          clear: both;
        }
      `}</style>

      {/* Progress Bar */}
      <div className="sticky top-20 z-40 bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-[980px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex gap-6 text-sm font-medium text-gray-700">
            <span className="flex items-center gap-2">
              <Clock size={16} /> {minutes} min
            </span>
            <span className="flex items-center gap-2">
              <BookOpen size={16} /> {wordsLearned} learned
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              await completeSession();
              router.push("/reading");
            }}
          >
            <CheckCircle size={16} className="mr-1" />
            Finish Reading
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="wiki-container">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <main className="wiki-content">
            <h1>{article.title}</h1>
            <hr />

            <div
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: article.cached_content || "" }}
            />
          </main>
        </div>
      </div>

      {/* Tooltip */}
      {(selectedWord || selectedText) && (
        <div
          className="reading-tooltip"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              {selectedText || selectedWord?.text}
            </h3>
            <button
              onClick={() => {
                setSelectedWord(null);
                setSelectedText("");
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={18} />
            </button>
          </div>

          {selectedWord && selectedWord.user_status && (
            <div className="mb-3">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  selectedWord.user_status === "known"
                    ? "bg-green-100 text-green-800"
                    : selectedWord.user_status === "learning"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {selectedWord.user_status === "known"
                  ? "Known"
                  : selectedWord.user_status === "learning"
                    ? "Learning"
                    : "Unknown"}
              </span>
            </div>
          )}

          {showTranslation && (
            <div className="p-3 bg-gray-50 rounded mb-3 text-sm">
              {isTranslating ? (
                <span className="text-gray-500">Translating...</span>
              ) : (
                <span className="text-gray-900 font-medium">
                  {translation || "No translation available"}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSpeak}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
              title="Listen"
            >
              <Volume2 size={16} />
              Listen
            </button>

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
              title="Translate"
            >
              <Languages size={16} />
              Translate
            </button>

            {selectedWord && selectedWord.user_status !== "known" && (
              <button
                onClick={handleMarkKnown}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
              >
                <Check size={16} />
                Known
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
