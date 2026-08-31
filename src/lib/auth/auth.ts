import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

const nextAuth = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;
export const auth = nextAuth.auth;