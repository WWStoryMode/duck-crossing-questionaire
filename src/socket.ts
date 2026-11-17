import { io, type Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import type { PublicState } from '../shared/types.js';

/** One shared connection per page. Reconnects automatically. */
export const socket: Socket = io({ autoConnect: true, transports: ['websocket', 'polling'] });

let latest: PublicState | null = null;
socket.on('state:public', (s: PublicState) => (latest = s));

/** Live public state + connection status. Re-synced by the server on every (re)connect. */
export function usePublicState() {
  const [state, setState] = useState<PublicState | null>(latest);
  const [connected, setConnected] = useState(socket.connected);
  useEffect(() => {
    const onState = (s: PublicState) => setState(s);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('state:public', onState);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('state:public', onState);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);
  return { state, connected };
}

/** emit with acknowledgement and a timeout so the UI never hangs. */
export function emitAck<T>(event: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(8000).emit(event, ...args, (err: Error | null, res: T) => (err ? reject(err) : resolve(res)));
  });
}
