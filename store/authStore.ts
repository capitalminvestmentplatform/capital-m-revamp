import { create } from "zustand";

interface User {
  email: string;
  firstLogin: boolean;
  // Add other fields if needed
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
