import { writable } from 'svelte/store';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    isError?: boolean;
}

export const messages = writable<Message[]>([]);
export const isStreaming = writable<boolean>(false);

export const clearChat = () => {
    messages.set([]);
};

export const addMessage = (role: Role, content: string, isError = false) => {
    messages.update(msgs => [
        ...msgs, 
        {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            role,
            content,
            timestamp: new Date(),
            isError
        }
    ]);
};
