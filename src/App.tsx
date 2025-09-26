import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/core/router";
import { AppProviders } from "@/core/providers/AppProviders";
import { useAuth } from "@/features/auth/hooks/useAuth";

const AppContent = () => {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
};

const App = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;

export default App;
