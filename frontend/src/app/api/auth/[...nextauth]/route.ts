import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("\n[Queueless Auth] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from .env.local! Google OAuth will fail with 401 invalid_client.\n");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: credentials?.username || "",
              password: credentials?.password || "",
            }).toString()
          });
          const user = await res.json();
          if (res.ok && user.access_token) {
            // Decode the JWT payload to get the role (without additional libraries)
            const payloadBase64 = user.access_token.split('.')[1];
            // Fix base64 padding issues
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            
            return {
              id: payload.sub,
              email: payload.sub,
              role: payload.role,
              accessToken: user.access_token,
            } as any;
          }
          return null;
        } catch (e) {
          console.error("Credentials Auth Error:", e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Call FastAPI to sync Google auth and get access_token
        try {
          const res = await fetch("http://127.0.0.1:8000/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              google_id: user.id || profile?.sub,
            })
          });
          
          if (!res.ok) {
            console.error("FastAPI rejected Google Sync:", await res.text());
            return false;
          }
          
          const data = await res.json();
          if (data.access_token) {
            // Decode JWT to get role
            const payloadBase64 = data.access_token.split('.')[1];
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            
            // Attach attributes to user object so they carry over to jwt callback
            (user as any).accessToken = data.access_token;
            (user as any).role = payload.role;
            return true;
          }
          return false;
        } catch (e) {
          console.error("Google Sync API Error:", e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_dev_queueless_2026",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
