import type { ReactNode } from "react";
import { ROUTES } from "../../app/router/routes";
import { NavLink } from "react-router-dom";

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
  },
  {
    label: "Избранное",
    to: ROUTES.favorites,
  },
  {
    label: "Профиль",
    to: ROUTES.profile,
  },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex maw-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <NavLink to={ROUTES.home} className="group">
            <div>
              <p className="text-lg font-bold tracking-tight">
                Terentakula Movies
              </p>
              <p className="text-xs text-slate-400 group-hover:text-slate-300">
                Movie & Series Tracker
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-medium transition",
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
        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
