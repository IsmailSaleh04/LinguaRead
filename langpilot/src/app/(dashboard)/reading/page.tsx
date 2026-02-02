"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { articlesApi } from "@/lib/api/articles";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Search,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { estimateReadingTime } from "@/lib/utils/formatters";

type FilterType = "all" | "difficulty" | "topic" | "length";

export default function ReadingPage() {
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, [currentLanguage]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-filter]")) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const loadRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const response =
        await articlesApi.preloadRecommendations(currentLanguage);
      if (response.success && response.data) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await articlesApi.searchWikipedia(
        searchQuery,
        currentLanguage,
      );
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleArticleSelect = async (title: string) => {
    try {
      const response = await articlesApi.fetchWikipediaArticle(
        title,
        currentLanguage,
      );
      if (response.success && response.data) {
        router.push(`/reading/${response.data.articleId}`);
      }
    } catch (error) {
      console.error("Failed to load article:", error);
    }
  };

  const filterArticles = (articles: any[]) => {
    if (filterType === "all") return articles;

    switch (filterType) {
      case "difficulty":
        return [...articles].sort(
          (a, b) => (a.difficulty_score ?? 0) - (b.difficulty_score ?? 0),
        );

      case "length":
        return [...articles].sort(
          (a, b) =>
            (a.wordCount ?? a.word_count ?? 0) -
            (b.wordCount ?? b.word_count ?? 0),
        );

      case "topic":
        return articles.filter((a) => a.topic); // or later: selectedTopicId

      default:
        return articles;
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 40) return "text-orange";
    return "text-red-600";
  };

  const getMatchIcon = (percentage: number) => {
    if (percentage >= 70) return <TrendingUp size={20} />;
    if (percentage >= 40) return <BookOpen size={20} />;
    return <TrendingDown size={20} />;
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 70) return "Easy";
    if (percentage >= 40) return "Perfect";
    return "Hard";
  };

  const displayResults = searchQuery.trim() ? searchResults : recommendations;
  const filteredResults = filterArticles(displayResults);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-dark mb-4">Discover Articles</h1>
        <p className="text-brown text-xl mb-8">
          Search Wikipedia or explore personalized recommendations
        </p>

        {/* Search Bar & Filter */}
        <div className="flex gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-4">
            <div className="relative" data-filter>
              <div className="relative">
                {/* Filter button */}
                <div
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-5 py-4 border-2 border-brown rounded-xl 
               cursor-pointer font-bold text-darkbrown bg-white
               hover:border-orange transition-colors select-none"
                >
                  Filter
                  <span className="text-lg">{isFilterOpen ? "⌃" : "⌄"}</span>
                </div>

                {/* Dropdown */}
                {isFilterOpen && (
                  <div
                    className="absolute left-0 mt-2 w-35 bg-white border-2 border-brown rounded-xl 
                 shadow-lg z-20 overflow-hidden"
                  >
                    {[
                      { value: "all", label: "All Articles" },
                      { value: "difficulty", label: "By Difficulty" },
                      { value: "topic", label: "By Topic" },
                      { value: "length", label: "By Length" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setFilterType(option.value as FilterType);
                          setIsFilterOpen(false);
                        }}
                        className={`px-5 py-3 cursor-pointer font-semibold transition-colors
            ${
              filterType === option.value
                ? "bg-orange bg-opacity-5"
                : "text-dark hover:bg-brown hover:bg-opacity-10"
            }`}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any topic on Wikipedia..."
                className="w-full px-6 py-4 pr-12 border-2 border-brown rounded-xl text-dark text-lg font-semibold
                         focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange focus:ring-opacity-20"
              />
              <Search
                size={24}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-brown"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {/* Difficulty Filter */}
      </div>

      {/* Loading States */}
      {(isSearching || isLoadingRecs) && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Recommended Articles Section */}
      {!searchQuery.trim() && !isLoadingRecs && recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={28} className="text-orange" />
            <h2 className="text-3xl font-bold text-dark">
              Recommended For You
            </h2>
          </div>
        </div>
      )}

      {/* Results */}
      {!isSearching && !isLoadingRecs && (
        <div className="space-y-4">
          {filteredResults.length === 0 && (
            <div className="text-center py-20">
              {searchQuery.trim() ? (
                <>
                  <Search
                    size={64}
                    className="text-brown opacity-40 mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-dark mb-3">
                    No results found
                  </h3>
                  <p className="text-brown text-lg">
                    Try a different search term
                  </p>
                </>
              ) : (
                <>
                  <Sparkles
                    size={64}
                    className="text-brown opacity-40 mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-dark mb-3">
                    Loading recommendations...
                  </h3>
                  <p className="text-brown text-lg">
                    We're finding articles perfect for your level
                  </p>
                </>
              )}
            </div>
          )}

          {filteredResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleArticleSelect(result.title)}
              className="bg-white rounded-xl p-6 border-2 border-brown border-opacity-20 
                       hover:border-orange hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {result.thumbnail && (
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-brown border-opacity-20"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-dark hover:text-orange transition-colors mb-2">
                        {result.title}
                      </h3>
                      {result.topic && (
                        <span className="inline-block px-3 py-1 bg-brown bg-opacity-10 text-brown font-bold rounded-lg text-sm">
                          {result.topic}
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${getMatchColor(result.matchPercentage)}`}
                      style={{
                        backgroundColor:
                          result.matchPercentage >= 70
                            ? "rgba(34, 197, 94, 0.1)"
                            : result.matchPercentage >= 40
                              ? "rgba(255, 131, 3, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      {getMatchIcon(result.matchPercentage)}
                    </div>
                  </div>

                  {result.summary && (
                    <p className="text-brown text-base mb-3 leading-relaxed">
                      {result.summary.substring(0, 200)}
                      {result.summary.length > 200 ? "..." : ""}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-brown font-semibold">
                    <span>{estimateReadingTime(result.wordCount)}</span>
                    <span>•</span>
                    <span>{result.wordCount} words</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
