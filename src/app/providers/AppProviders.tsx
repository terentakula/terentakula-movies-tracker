import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../../features/auth/store/authStore";
import { useUserLibraryStore } from "../../features/user-library/store/userLibraryStore";

const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const user = useAuthStore((state) => state.user);
  const initAuth = useAuthStore((state) => state.initAuth);

  const loadUserLibrary = useUserLibraryStore((state) => state.loadUserLibrary);
  const clearLibraryState = useUserLibraryStore(
    (state) => state.clearLibraryState,
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    void initAuth().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      cleanup?.();
    };
  }, [initAuth]);

  useEffect(() => {
    if(!user) {
      clearLibraryState()
      return
    }

    void loadUserLibrary(user.id)
  }, [user, loadUserLibrary, clearLibraryState])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
