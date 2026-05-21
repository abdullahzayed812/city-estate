import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (socketInstance?.connected) return socketInstance;

  const { tokens } = useAuthStore.getState();

  socketInstance = io(SOCKET_URL, {
    auth: { token: tokens?.accessToken },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socketInstance;
}

export function disconnectSocket(): void {
  socketInstance?.disconnect();
  socketInstance = null;
}
