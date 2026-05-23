import { useState, type FormEvent } from "react";
import { useAuthStore } from "../store/authStore";

export const AuthModal = () => {
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const authModalReason = useAuthStore((state) => state.authModalReason);
  const authMode = useAuthStore((state) => state.authMode);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const authError = useAuthStore((state) => state.authError);
  const authMessage = useAuthStore((state) => state.authMessage);

  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);

  const [name, setName] = useState("Александр");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isAuthModalOpen) {
    return null;
  }

  const isSignUp = authMode === "sign-up";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSignUp) {
      await signUp({
        name: name.trim() || "Пользователь",
        email: email.trim(),
        password,
      });
      return;
    }

    await signIn({
      email: email.trim(),
      password,
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
            {isSignUp ? "Создать аккаунт" : "Войти в профиль"}
          </h2>

          <p className="text-sm leading-6 text-slate-400">{authModalReason}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp ? (
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
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              placeholder="Введите email"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Пароль
            </span>
            <input
              value={password}
              type="password"
              required
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              placeholder="Минимум 6 символов"
            />
          </label>

          {authError ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
              {authError}
            </div>
          ) : null}

          {authMessage ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200">
              {authMessage}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={isAuthLoading}
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              {isAuthLoading
                ? "Проверяем..."
                : isSignUp
                  ? "Зарегестрироваться"
                  : "Войти"}
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

        <div className="mt-5 border-t border-white/10 pt-5">
          {isSignUp ? (
            <button
              type="button"
              className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              onClick={() =>
                openAuthModal(
                  "Войдите, чтобы пользоваться личными функциями.",
                  "sign-in",
                )
              }
            >
              Уже есть аккаунт? Войти
            </button>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              onClick={() =>
                openAuthModal(
                  "Создайте аккаунт, чтобы сохранять фильмы, оценки и заметки.",
                  "sign-up",
                )
              }
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
