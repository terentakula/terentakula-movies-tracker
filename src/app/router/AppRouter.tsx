import { HashRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes";
import { HomePage } from "../../pages/HomePage/HomePage";
import { SearchPage } from "../../pages/SearchPage/SearchPage";
import { DetailsPage } from "../../pages/DetailsPage/DetailsPage";
import { WatchlistPage } from "../../pages/WatchlistPage/WatchlistPage";
import { FavotitesPage } from "../../pages/FavoritesPage/FavotitesPage";
import { ProfilePage } from "../../pages/ProfilePage/ProfilePage";
import { AppLayout } from "../../shared/components/AppLayout";
import { PersonDetailsPage } from "../../pages/PersonalDetailsPage/PresonDetailsPage";
import { CollectionPage } from "../../pages/CollectionPage/CollectionPage";
import { RequireAuth } from "../../features/auth/components/RequireAuth";

export const AppRouter = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.search} element={<SearchPage />} />
          <Route
            path={ROUTES.movieDetails}
            element={<DetailsPage mediaType="movie" />}
          />
          <Route
            path={ROUTES.tvDetails}
            element={<DetailsPage mediaType="tv" />}
          />
          <Route path={ROUTES.personDetails} element={<PersonDetailsPage />} />
          <Route
            path={ROUTES.watchlist}
            element={
              <RequireAuth
                title="Хочу посмотреть"
                description="Войдите, чтобы сохранять фильмы и сериалы в личный список."
              >
                <WatchlistPage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.favorites}
            element={
              <RequireAuth
                title="Избранное"
                description="Войдите, чтобы добавлять фильмы и сериалы в избранное."
              >
                <FavotitesPage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.profile}
            element={
              <RequireAuth
                title="Личный профиль"
                description="Войдите, чтобы видеть личную статистику, оценки, заметки и сохранённые фильмы."
              >
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path={ROUTES.collection} element={<CollectionPage />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};
