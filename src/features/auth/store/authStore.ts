import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthRole = "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

type AuthState = {
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  authModalReason: string;

  openAuthModal: (reason?: string) => void;
  closeAuthmodal: () => void;
  loginDemo: (data: { name: string; email: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthModalOpen: false,
      authModalReason: "Войдите, чтобы пользоваться личными функциями.",

      openAuthModal: (reason) => {
        set({
          isAuthModalOpen: true,
          authModalReason:
            reason || "Войдите, чтобы пользоваться личными функциями.",
        });
      },

      closeAuthmodal: () => {
        set({ isAuthModalOpen: false });
      },

      loginDemo: ({ name, email }) => {
        set({
          user: {
            id: crypto.randomUUID(),
            name,
            email,
            role: "user",
          },
          isAuthModalOpen: false,
        });
      },

      logout: () => {
        set({
          user: null,
        });
      },
    }),
    {
      name: "terentakula-movies-auth",
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);
