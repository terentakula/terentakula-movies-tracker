import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

export const AuthModal = () => {
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const authModalReason = useAuthStore((state) => state.authModalReason);
  const closeAuthModal = useAuthStore((state) => state.closeAuthmodal);
  const loginDemo = useAuthStore((state) => state.loginDemo);

  const [name, setName] = useState("Александр");
  const [email, setEmail] = useState("demo@gmail.com");

  if (!isAuthModalOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    loginDemo({
      name: name.trim() || "Пользователь",
      email: email.trim() || "demo@gmail.com",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-2 backdrop-blur-sm ">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Авторизация
          </p>

          <h2 className="mb-3 text-2xl font-bold text-white">
            Войдите в профиль
          </h2>

          <p className="text-sm leading-6 text-slate-400">{authModalReason}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Имя
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              placeholder="Введите имя"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              placeholder="Введите email"
            />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
                type="submit"
                className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
                Войти
            </button>

            <button
                type="button"
                onClick={closeAuthModal}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
                Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
