import { query } from "@/db/db";
import { getUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

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
    const { text, from, to } = body;

    // Using LibreTranslate (free, self-hosted option)
    // Or you can use Google Translate API, DeepL API
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text',
      }),
    });

    const data = await response.json();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        translation: data.translatedText,
        source: text,
      },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    );
  }
}
