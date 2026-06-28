import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { COLORS, SIDEBAR, MOTION } from "../../constants/theme";
import { useUiStore } from "../../store/uiStore";

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflow: "auto",
    background: COLORS.bg.layer0,
    padding: 24,
  },
};

export function MainLayout() {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <Header />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
