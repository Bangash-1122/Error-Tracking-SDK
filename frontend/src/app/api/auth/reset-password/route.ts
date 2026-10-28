import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerDb } from '@/lib/server/db';
import { hashPassword } from '@/lib/server/auth';

const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is missing or invalid'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;
    const db = getServerDb();
    const userId = db.verifyPasswordResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await db.updateUserPassword(userId, newHash);
    db.consumePasswordResetToken(token);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You may now sign in.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to reset password' }, { status: 500 });
  }
}
