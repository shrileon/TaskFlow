import { create } from 'zustand';
import type { User } from '../types/user';
import { mockUsers } from '../data/mockData';

interface UserState {
  users: User[];
  currentUserId: string;
  getUser: (id: string) => User | undefined;
  getCurrentUser: () => User;
}

export const useUserStore = create<UserState>()((_set, get) => ({
  users: mockUsers,
  currentUserId: 'user-1',

  getUser: (id) => get().users.find((u) => u.id === id),

  getCurrentUser: () => {
    const user = get().users.find((u) => u.id === get().currentUserId);
    if (!user) throw new Error('Current user not found');
    return user;
  },
}));