import { browser } from '$app/environment';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
	id: string;
	role: Role;
	content: string;
	timestamp: Date;
	isError?: boolean;
}

const STORAGE_KEY = 'gh_chat_msgs';

const getInitialMessages = (): Message[] => {
	if (!browser) return [];
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return [];
		const parsed = JSON.parse(saved);
		return parsed.map((m: any) => ({
			...m,
			timestamp: new Date(m.timestamp)
		}));
	} catch {
		return [];
	}
};

export const chatState = $state<{
	messages: Message[];
	isStreaming: boolean;
	abortController: AbortController | null;
}>({
	messages: getInitialMessages(),
	isStreaming: false,
	abortController: null
});

export const saveChatData = () => {
	if (browser) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(chatState.messages));
		} catch {}
	}
};

export const clearChat = () => {
	chatState.messages = [];
	saveChatData();
};

export const deleteFrom = (id: string) => {
	const idx = chatState.messages.findIndex((m) => m.id === id);
	if (idx !== -1) {
		chatState.messages = chatState.messages.slice(0, idx);
		saveChatData();
	}
};

export const updateMessage = (id: string, content: string) => {
	const msg = chatState.messages.find((m) => m.id === id);
	if (msg) {
		msg.content = content;
		saveChatData();
	}
};

export const addMessage = (role: Role, content: string, isError = false) => {
	chatState.messages.push({
		id: Date.now().toString() + Math.random().toString(36).substring(7),
		role,
		content,
		timestamp: new Date(),
		isError
	});
	saveChatData();
};
