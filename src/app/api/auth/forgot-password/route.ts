import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { nanoid } from 'nanoid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store token in backend (create password_reset_tokens or use KV)
    const response = await fetch(`${API_URL}/api/v1/auth/create-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: resetToken, expiresAt }),
    });

    // Even if user doesn't exist, we return success to prevent email enumeration
    // The backend should only store token if user exists
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.name !== undefined) {
        // User exists, send email
        try {
          await sendPasswordResetEmail(email, resetToken, data.data.name);
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          // Still return success to prevent enumeration
        }
      }
    }

    // Always return success
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
