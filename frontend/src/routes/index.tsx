import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { Dashboard } from "../pages/Dashboard";
import { NewAudit } from "../pages/NewAudit";
import { SessionLive } from "../pages/SessionLive";
import { Sessions } from "../pages/Sessions";
import { SessionDetail } from "../pages/SessionDetail";
import { Findings } from "../pages/Findings";
import { Reports } from "../pages/Reports";
import { Models } from "../pages/Models";
import { Agents } from "../pages/Agents";
import { Memory } from "../pages/Memory";
import { SettingsPage } from "../pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "new-audit", element: <NewAudit /> },
      { path: "sessions", element: <Sessions /> },
      { path: "session/:sessionId", element: <SessionDetail /> },
      { path: "session/:sessionId/live", element: <SessionLive /> },
      { path: "findings", element: <Findings /> },
      { path: "reports", element: <Reports /> },
      { path: "models", element: <Models /> },
      { path: "agents", element: <Agents /> },
      { path: "memory", element: <Memory /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
