import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerDb } from '@/lib/server/db';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const db = getServerDb();
    const user = await db.getUserByEmail(email);

    // To prevent email enumeration, return success message even if email not found
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    const token = db.createPasswordResetToken(user.id);
    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully.',
      // In development / demo environment, return the resetUrl for immediate copy/test
      resetUrl,
      token,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
