import React, {  useState, type ReactNode } from "react";
import { ROUTES } from "../../app/router/routes";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { AuthModal } from "../../features/auth/components/AuthModal";
import { FiMenu, FiX } from "react-icons/fi";

type AppLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    label: "Главная",
    to: ROUTES.home,
  },
  {
    label: "Поиск",
    to: ROUTES.search,
  },
  {
    label: "Хочу посмотреть",
    to: ROUTES.watchlist,
    protected: true,
  },
  {
    label: "Избранное",
    to: ROUTES.favorites,
    protected: true,
  },
  {
    label: "Профиль",
    to: ROUTES.profile,
    protected: true,
  },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const logout = useAuthStore((state) => state.logout);


  const handleNavClick  = (
    event: React.MouseEvent<HTMLAnchorElement>,
    isProtected?: boolean,
  ) => {
    if (isProtected || !user) {
      event.preventDefault()
      openAuthModal("Войдите, чтобы открыть этот раздел.");
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <NavLink to={ROUTES.home} className="group">
            <div>
              <p className="text-base font-bold tracking-tight sm:text-lg">
                Terentakula Movies
              </p>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">
                Movie & Series Tracker
              </p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-4 md:flex">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={(e) => {
                    handleNavClick(e, item.protected);
                  }}
                  className={({ isActive }) =>
                    [
                      "rounded-full px-3 py-2 text-xs font-medium transition",
                      isActive
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Вы вошли как
                  </p>
                  <p className="max-w-32 truncate text-sm font-bold text-white">
                    {user.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-red-400/30 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/10"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openAuthModal(
                    "Войдите, чтобы пользоваться личными функциями.",
                  )
                }
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cean-300"
              >
                Войти
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:bg-white/10 md:hidden"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={(e) => {
                    handleNavClick(e, item.protected);
                  }}
                  className={({ isActive }) =>
                    [
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-slate-950"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-3 border-t border-white/10 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs text-slate-500">Вы вошли как</p>
                      <p className="mb-1 font-bold text-white">{user.name}</p>
                      <p className="mb-1 text-xs text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/10"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal(
                          "Войдите, чтобы пользоваться личными функциями"
                        )
                      }}
                      className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                    >Войти</button>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <AuthModal />
    </div>
  );
};
