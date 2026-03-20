export type Role = 'user' | 'assistant' | 'system';

export interface Message {
	id: string;
	role: Role;
	content: string;
	timestamp: Date;
	isError?: boolean;
}

export const chatState = $state<{
	messages: Message[];
	isStreaming: boolean;
}>({
	messages: [],
	isStreaming: false
});

export const clearChat = () => {
	chatState.messages = [];
};

export const addMessage = (role: Role, content: string, isError = false) => {
	chatState.messages.push({
		id: Date.now().toString() + Math.random().toString(36).substring(7),
		role,
		content,
		timestamp: new Date(),
		isError
	});
};
