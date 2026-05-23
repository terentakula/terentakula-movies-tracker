import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../../../shared/api/supabaseClient";

export type AuthRole = "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

type AuthMode = "sign-in" | "sign-up";

type AuthState = {
  user: AuthUser | null;
  session: Session | null;
  isAuthLoading: boolean;
  authError: string | null;
  authMessage: string | null;

  isAuthModalOpen: boolean;
  authModalReason: string;
  authMode: AuthMode;

  openAuthModal: (reason?: string, mode?: AuthMode) => void;
  closeAuthModal: () => void;

  initAuth: () => Promise<() => void>;
  signIn: (data: { email: string; password: string }) => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const mapSupabaseUser = (user: User): AuthUser => {
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : (user.email?.split("@")[0] ?? "Пользователь"),
    role: "user",
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthLoading: true,
  authError: null,
  authMessage: null,

  isAuthModalOpen: false,
  authModalReason: "Войдите, чтобы пользоваться личными функциями.",
  authMode: "sign-in",

  openAuthModal: (reason, mode = "sign-in") => {
    set({
      isAuthModalOpen: true,
      authMode: mode,
      authError: null,
      authMessage: null,
      authModalReason:
        reason || "Войдите, чтобы пользоваться личными функциями.",
    });
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
      authError: null,
      authMessage: null,
    });
  },

  initAuth: async () => {
    set({ isAuthLoading: true });

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      set({
        user: null,
        session: null,
        isAuthLoading: false,
        authError: error.message,
      });
    } else {
      set({
        session: data.session,
        user: data.session?.user ? mapSupabaseUser(data.session.user) : null,
        isAuthLoading: false,
        authError: null,
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ? mapSupabaseUser(session.user) : null,
        isAuthLoading: false,
        authError: null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signIn: async ({ email, password }) => {
    set({
      isAuthLoading: true,
      authError: null,
      authMessage: null,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({
        isAuthLoading: false,
        authError: error.message,
      });
      return;
    }

    set({
      session: data.session,
      user: data.user ? mapSupabaseUser(data.user) : null,
      isAuthLoading: false,
      isAuthModalOpen: false,
      authError: null,
      authMessage: null,
    });
  },

  signUp: async ({ name, email, password }) => {
    set({
      isAuthLoading: true,
      authError: null,
      authMessage: null,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      set({
        isAuthLoading: false,
        authError: error.message,
      });

      return;
    }

    if (!data.session) {
      set({
        isAuthLoading: false,
        authMessage:
          "Регистрация создана. Если требуется подтверждение email, проверьте почту.",
      });
      return;
    }

    set({
      session: data.session,
      user: data.user ? mapSupabaseUser(data.user) : null,
      isAuthLoading: false,
      isAuthModalOpen: false,
      authError: null,
      authMessage: null,
    });
  },

  logout: async () => {
    set({ isAuthLoading: true });

    const { error } = await supabase.auth.signOut();

    if (error) {
      set({
        isAuthLoading: false,
        authError: error.message,
      });
      return;
    }

    set({
      user: null,
      session: null,
      isAuthLoading: false,
      authMessage: null,
    });
  },
}));
