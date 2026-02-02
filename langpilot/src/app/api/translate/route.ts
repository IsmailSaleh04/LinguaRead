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

    // MyMemory Translation API - FREE, 1000 requests/day
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.append('q', text);
    url.searchParams.append('langpair', `${from}|${to}`);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.responseStatus === 200 || data.responseData) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          translation: data.responseData.translatedText,
          source: text,
        },
      });
    }

    throw new Error('Translation failed');

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    );
  }
}

