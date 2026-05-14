import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  stats: {
    totalMembers: 0,
    activeMembers: 0,
    lastServiceAttendance: 0,
    monthlyIncome: 0,
  },
  setStats: (stats) => set({ stats }),

  notification: null,
  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
}));

export default useStore;

