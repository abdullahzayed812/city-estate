import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_SERVER_IP = '192.168.0.128';
export const SERVER_IP_KEY = 'server_ip';

interface ConfigState {
  serverIp: string;
  isConfigured: boolean;
  isLoading: boolean;
  setServerIp: (ip: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  serverIp: DEFAULT_SERVER_IP,
  isConfigured: false,
  isLoading: true,

  setServerIp: async (ip: string) => {
    await AsyncStorage.setItem(SERVER_IP_KEY, ip);
    set({ serverIp: ip, isConfigured: true });
  },

  hydrate: async () => {
    try {
      const ip = await AsyncStorage.getItem(SERVER_IP_KEY);
      if (ip) {
        set({ serverIp: ip, isConfigured: true });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
