import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";

type RequireAuthprops = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export const RequireAuth = ({
  children,
  title = "Нужна авторизация",
  description = "Эта страница доступна только авторизованному пользователю.",
}: RequireAuthprops) => {
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  if (user) {
    return children;
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
        Private area
      </p>

      <h1 className="mb-4 text-3xl font-bold text-white">{title}</h1>

      <p className="mb-6 mx-auto max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>

      <button
        type="button"
        onClick={() => openAuthModal(description)}
        className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
      >
        Войти
      </button>
    </section>
  );
};
