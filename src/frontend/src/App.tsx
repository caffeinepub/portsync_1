import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ActorRole, type UserProfile } from "./backend.d";
import { Layout } from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useSaveProfile, useUserProfile } from "./hooks/useQueries";
import { seedInitialData } from "./lib/seedData";
import { CargoPage } from "./pages/CargoPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ReportsPage } from "./pages/ReportsPage";

const PROFILE_KEY = "portsync_profile";

// ---- Router Setup ----
function AppShell() {
  const { actor, isFetching: actorLoading } = useActor();
  const { data: backendProfile, isLoading: profileLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [localProfile, setLocalProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [seeded, setSeeded] = useState(false);

  // Sync backend profile to local
  useEffect(() => {
    if (backendProfile) {
      setLocalProfile(backendProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(backendProfile));
    }
  }, [backendProfile]);

  // Seed data once actor is ready
  useEffect(() => {
    if (actor && !actorLoading && !seeded) {
      setSeeded(true);
      seedInitialData(actor);
    }
  }, [actor, actorLoading, seeded]);

  const isLoading = actorLoading || profileLoading;

  const handleLogin = async (name: string, role: ActorRole) => {
    const profile: UserProfile = { name, role };
    setLocalProfile(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    try {
      await saveProfile.mutateAsync(profile);
    } catch {
      // ok to ignore, local profile is set
    }
  };

  const handleLogout = () => {
    setLocalProfile(null);
    localStorage.removeItem(PROFILE_KEY);
  };

  if (isLoading && !localProfile) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 mx-auto flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <p className="text-sidebar-foreground/50 text-sm">
            Loading PortSync...
          </p>
        </div>
      </div>
    );
  }

  if (!localProfile) {
    return (
      <LoginPage onLogin={handleLogin} isLoading={saveProfile.isPending} />
    );
  }

  return (
    <Layout profile={localProfile} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: AppShell,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function DashboardRoute() {
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile: UserProfile = stored
      ? JSON.parse(stored)
      : { name: "", role: ActorRole.portAgent };
    return <DashboardPage profile={profile} />;
  },
});

const cargoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cargo",
  component: function CargoRoute() {
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile: UserProfile = stored
      ? JSON.parse(stored)
      : { name: "", role: ActorRole.portAgent };
    return <CargoPage profile={profile} />;
  },
});

const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/documents",
  component: function DocumentsRoute() {
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile: UserProfile = stored
      ? JSON.parse(stored)
      : { name: "", role: ActorRole.portAgent };
    return <DocumentsPage profile={profile} />;
  },
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: function MessagesRoute() {
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile: UserProfile = stored
      ? JSON.parse(stored)
      : { name: "", role: ActorRole.portAgent };
    return <MessagesPage profile={profile} />;
  },
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  cargoRoute,
  documentsRoute,
  messagesRoute,
  reportsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
