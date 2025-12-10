import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import type { Session } from 'next-auth';
import { authAPI } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
type WithAccess = { accessToken?: string; team?: Session['team'] };

// Helper to handle OAuth user registration/login
async function handleOAuthUser(profile: {
  email: string;
  name: string;
  image?: string;
  provider: string;
  providerAccountId: string;
}) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with OAuth');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('OAuth user handling error:', error);
    throw error;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const result = await authAPI.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            image: result.user.image,
            accessToken: result.token,
            team: result.team,
          };
        } catch {
          throw new Error('Invalid email or password');
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in with credentials
      if (user && !account?.provider) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        const withExtras = user as typeof user & WithAccess;
        token.accessToken = withExtras.accessToken;
        token.team = withExtras.team;
      }

      // Handle OAuth sign in
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        try {
          const avatarUrl =
            profile && typeof profile === 'object' && 'avatar_url' in profile
              ? (profile as { avatar_url?: string }).avatar_url
              : undefined;
          const oauthData = await handleOAuthUser({
            email: token.email as string,
            name: (token.name as string) || (profile as { name?: string })?.name || 'User',
            image: (token.picture as string) || avatarUrl,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          token.id = oauthData.user.id;
          token.accessToken = oauthData.token;
          token.team = oauthData.team;
        } catch (error) {
          console.error('Failed to handle OAuth user:', error);
          // Don't throw - allow sign in but without team/accessToken
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.accessToken = token.accessToken as string | undefined;
        session.team = token.team as Session['team'];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify',
    newUser: '/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  debug: process.env.NODE_ENV === 'development',
});

// Type augmentation for NextAuth v5
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
    accessToken?: string;
    team?: {
      id: string;
      name: string;
      plan: 'free';
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    accessToken?: string;
    team?: {
      id: string;
      name: string;
      plan: 'free';
      role: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    team?: {
      id: string;
      name: string;
      plan: 'free';
      role: string;
    };
  }
}
