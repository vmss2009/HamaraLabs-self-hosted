import { EventEmitter } from 'events';

class ChatBus extends EventEmitter {}
export const chatBus = new ChatBus();

export type ChatEvents = {
  message: {
    roomId: string;
    messageId: string;
  };
};