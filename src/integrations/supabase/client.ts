// Stub Supabase client used by the marketing pages.
// Replace with a real client when Lovable Cloud is enabled.
type AuthChange = (event: string, session: null) => void;
const noSession = { data: { session: null } as { session: null } };

export const supabase = {
  auth: {
    onAuthStateChange(cb: AuthChange) {
      // call once with null session then return subscription stub
      setTimeout(() => cb("INITIAL_SESSION", null), 0);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    async getSession() { return noSession; },
    async signInWithPassword(_args: { email: string; password: string }) {
      return { error: { message: "Authentication is not configured yet. Enable Lovable Cloud to sign in." } as Error };
    },
    async signUp(_args: { email: string; password: string; options?: unknown }) {
      return { error: { message: "Authentication is not configured yet. Enable Lovable Cloud to sign up." } as Error };
    },
    async signOut() { return { error: null }; },
  },
};
