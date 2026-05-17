import { EventEmitter } from 'events';

class ChatBus extends EventEmitter {}

// Ensure singleton across dev hot reloads and route module reloads
declare global {
  // eslint-disable-next-line no-var
  var __chatBus: ChatBus | undefined;
}

const bus = global.__chatBus ?? new ChatBus();
if (!global.__chatBus) {
  bus.setMaxListeners(100);
  global.__chatBus = bus;
}

export const chatBus = bus;

export type ChatEvents = {
  message: {
    roomId: string;
    messageId: string;
  };
  room: {
    roomId: string;
    action: 'updated' | 'deleted';
  };
};
