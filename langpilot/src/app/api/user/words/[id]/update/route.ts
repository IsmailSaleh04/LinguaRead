import { query } from "@/db/db";
import { getUserFromRequest } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, status } = body; // action: 'translate' | 'mark' | 'expose'

    // Get current word status
    const currentStatus = await query(
      `SELECT * FROM user_words WHERE user_id = $1 AND word_id = $2`,
      [user.userId, id]
    );

    let newStatus = status;
    let translationClicks = currentStatus.rows[0]?.translation_clicks || 0;
    let exposureCount = (currentStatus.rows[0]?.exposure_count || 0) + 1;

    if (action === 'translate') {
      translationClicks++;
    }

    // Auto-progression logic
    if (!status) { // If status not manually set
      const current = currentStatus.rows[0]?.status || 'unknown';
      
      if (current === 'unknown') {
        // Unknown → Learning: After 1 translation OR 3 exposures
        if (translationClicks >= 1 || exposureCount >= 3) {
          newStatus = 'learning';
        } else {
          newStatus = 'unknown';
        }
      } else if (current === 'learning') {
        // Learning → Known: After 5 exposures (but only if user confirms)
        newStatus = 'learning';
      } else {
        newStatus = current;
      }
    }

    // Upsert user word with smart progression
    const result = await query(
      `INSERT INTO user_words (user_id, word_id, status, exposure_count, translation_clicks, last_seen_at, marked_known_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, ${newStatus === 'known' ? 'CURRENT_TIMESTAMP' : 'NULL'})
       ON CONFLICT (user_id, word_id) DO UPDATE SET
         status = $3,
         exposure_count = $4,
         translation_clicks = $5,
         last_seen_at = CURRENT_TIMESTAMP,
         marked_known_at = CASE WHEN $3 = 'known' THEN CURRENT_TIMESTAMP ELSE user_words.marked_known_at END
       RETURNING *`,
      [user.userId, id, newStatus, exposureCount, translationClicks]
    );

    // Add translation_clicks column to user_words table if not exists:
    // ALTER TABLE user_words ADD COLUMN IF NOT EXISTS translation_clicks INTEGER DEFAULT 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...result.rows[0],
        statusChanged: currentStatus.rows[0]?.status !== newStatus,
      },
    });

  } catch (error) {
    console.error('Update word error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
