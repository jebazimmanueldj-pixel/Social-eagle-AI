import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserInfo } from "../types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  setSession: (s: { accessToken: string; refreshToken: string; user: UserInfo }) => void;
  clear: () => void;
  hasRole: (role: string) => boolean;
  hasMenu: (menu: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
      hasRole: (role) => Boolean(get().user?.roles?.includes(role)),
      hasMenu: (menu) => Boolean(get().user?.menus?.includes(menu)),
    }),
    { name: "aml-auth" }
  )
);
