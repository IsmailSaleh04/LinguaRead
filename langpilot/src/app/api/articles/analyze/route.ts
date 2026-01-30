// src/app/api/articles/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/db';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, text, language } = body;

    if (!url && !text) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'URL or text required' },
        { status: 400 }
      );
    }

    let articleText = text;
    
    // If URL provided, fetch the article
    if (url && !text) {
      try {
        // Simple fetch - in production you'd want a proper article extractor
        // Consider using libraries like: @mozilla/readability, jsdom, cheerio
        const response = await fetch(url);
        const html = await response.text();
        
        // Very basic text extraction (you should use a proper library)
        articleText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        if (!articleText || articleText.length < 100) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'Could not extract text from URL. Please provide text directly.' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Failed to fetch URL' },
          { status: 400 }
        );
      }
    }

    // Tokenize and clean the text
    const words = articleText
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ') // Keep apostrophes and hyphens
      .split(/\s+/)
      .filter((w: string | any[]) => w.length > 1); // Filter out single characters

    const uniqueWords = [...new Set(words)];
    
    // Look up words in database to see which ones user knows
    const wordsResult = await query(
      `SELECT w.id, w.text, w.difficulty_level, 
              COALESCE(uw.status, 'unknown') as user_status
       FROM words w
       LEFT JOIN user_words uw ON w.id = uw.word_id AND uw.user_id = $1
       WHERE w.text = ANY($2) AND w.language_code = $3`,
      [user.userId, uniqueWords, language || 'en']
    );

    const foundWords = wordsResult.rows;
    const knownWords = foundWords.filter(w => w.user_status === 'known').length;
    const learningWords = foundWords.filter(w => w.user_status === 'learning').length;
    const unknownWords = foundWords.filter(w => w.user_status === 'unknown' || !w.user_status).length;
    
    // Words not in our database at all
    const foundWordTexts = new Set(foundWords.map(w => w.text));
    const wordsNotInDb = uniqueWords.filter(w => !foundWordTexts.has(w));
    
    const totalUniqueWords = uniqueWords.length;
    
    // Calculate difficulty score (0 = very easy, 1 = very hard)
    // Based on percentage of unknown words
    const unknownPercentage = (unknownWords + wordsNotInDb.length) / totalUniqueWords;
    const difficultyScore = Math.round(unknownPercentage * 100) / 100;

    // Calculate estimated CEFR level based on difficulty
    let cefrLevel = 'C2';
    if (difficultyScore < 0.3) cefrLevel = 'A1';
    else if (difficultyScore < 0.4) cefrLevel = 'A2';
    else if (difficultyScore < 0.6) cefrLevel = 'B1';
    else if (difficultyScore < 0.8) cefrLevel = 'B2';
    else if (difficultyScore < 0.9) cefrLevel = 'C1';

    // Calculate difficulty breakdown by CEFR level (if we have that data)
    const cefrBreakdown = {
      A1: foundWords.filter(w => w.difficulty_level === 'A1').length,
      A2: foundWords.filter(w => w.difficulty_level === 'A2').length,
      B1: foundWords.filter(w => w.difficulty_level === 'B1').length,
      B2: foundWords.filter(w => w.difficulty_level === 'B2').length,
      C1: foundWords.filter(w => w.difficulty_level === 'C1').length,
      C2: foundWords.filter(w => w.difficulty_level === 'C2').length,
    };

    // Determine if article is recommended (sweet spot: 20-40% unknown words)
    const isRecommended = unknownPercentage >= 0.2 && unknownPercentage <= 0.4;
    
    // Generate recommendation message
    let recommendation = '';
    if (unknownPercentage < 0.1) {
      recommendation = 'Too easy - You know almost all words. Try a harder article.';
    } else if (unknownPercentage < 0.2) {
      recommendation = 'Easy - Good for casual reading and reinforcement.';
    } else if (unknownPercentage <= 0.4) {
      recommendation = 'Perfect difficulty - Ideal for learning new words!';
    } else if (unknownPercentage <= 0.6) {
      recommendation = 'Challenging - You\'ll learn many new words, but might be difficult.';
    } else {
      recommendation = 'Too difficult - Too many unknown words. Try an easier article first.';
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        // Basic counts
        totalWords: words.length,
        uniqueWords: totalUniqueWords,
        
        // User's knowledge breakdown
        knownWords,
        learningWords,
        unknownWords,
        wordsNotInDatabase: wordsNotInDb.length,
        
        // Difficulty metrics
        difficultyScore,
        unknownPercentage: Math.round(unknownPercentage * 100),
        estimatedLevel: cefrLevel,
        
        // CEFR breakdown
        cefrBreakdown,
        
        // Recommendation
        isRecommended,
        recommendation,
        
        // Sample unknown words (first 10)
        sampleUnknownWords: foundWords
          .filter(w => w.user_status === 'unknown' || !w.user_status)
          .slice(0, 10)
          .map(w => ({ text: w.text, level: w.difficulty_level })),
      },
    });

  } catch (error) {
    console.error('Analyze article error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}