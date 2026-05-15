import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User, Order, Notification } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null }),
      }),
      {
        name: "wp-auth",
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
);

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
}));

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  emergencyMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setEmergencyMode: (mode: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "dark",
      emergencyMode: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setEmergencyMode: (emergencyMode) => set({ emergencyMode }),
    }),
    { name: "wp-ui" }
  )
);

interface OrderState {
  activeOrder: Order | null;
  orderDraft: Partial<Order> | null;
  setActiveOrder: (order: Order | null) => void;
  setOrderDraft: (draft: Partial<Order> | null) => void;
  updateOrderDraft: (updates: Partial<Order>) => void;
  clearOrderDraft: () => void;
}

export const useOrderStore = create<OrderState>()((set) => ({
  activeOrder: null,
  orderDraft: null,
  setActiveOrder: (activeOrder) => set({ activeOrder }),
  setOrderDraft: (orderDraft) => set({ orderDraft }),
  updateOrderDraft: (updates) =>
    set((state) => ({ orderDraft: { ...state.orderDraft, ...updates } })),
  clearOrderDraft: () => set({ orderDraft: null }),
}));

interface ChatState {
  typingUsers: Record<string, boolean>;
  onlineUsers: string[];
  setTyping: (userId: string, isTyping: boolean) => void;
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  typingUsers: {},
  onlineUsers: [],
  setTyping: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),
}));
