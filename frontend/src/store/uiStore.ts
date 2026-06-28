import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  isMobile: boolean;
  selectedSessionId: string | null;
  drawerOpen: boolean;
  drawerContent: string | null;
  commandPaletteOpen: boolean;
  developerMode: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobile: (mobile: boolean) => void;
  setSelectedSessionId: (id: string | null) => void;
  openDrawer: (content: string) => void;
  closeDrawer: () => void;
  toggleCommandPalette: () => void;
  toggleDeveloperMode: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: true,
  isMobile: false,
  selectedSessionId: null,
  drawerOpen: false,
  drawerContent: null,
  commandPaletteOpen: false,
  developerMode: false,

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobile: (mobile) => set({ isMobile: mobile, sidebarOpen: !mobile }),
  setSelectedSessionId: (id) => set({ selectedSessionId: id }),
  openDrawer: (content) => set({ drawerOpen: true, drawerContent: content }),
  closeDrawer: () => set({ drawerOpen: false, drawerContent: null }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  toggleDeveloperMode: () =>
    set((s) => ({ developerMode: !s.developerMode }),
  ),
}));
