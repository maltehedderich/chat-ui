import {
	chatState,
	addMessage,
	saveChatData,
	deleteFrom,
	updateMessage,
	type Message
} from '$lib/stores/chat.svelte';
import { configState } from '$lib/stores/config.svelte';
import { uiState, showToast } from '$lib/stores/ui.svelte';

export const stopStreaming = () => {
	if (chatState.abortController) {
		chatState.abortController.abort();
		chatState.abortController = null;
		chatState.isStreaming = false;
	}
};

const triggerGeneration = async () => {
	chatState.isStreaming = true;
	chatState.abortController = new AbortController();

	// Prepare payload
	const payload = {
		model: configState.modelId,
		temperature: configState.temperature,
		max_tokens: configState.maxTokens,
		stream: configState.stream,
		messages: [
			{ role: 'system', content: configState.systemPrompt },
			...chatState.messages.map((m) => ({ role: m.role, content: m.content }))
		]
	};

	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (configState.apiKey) headers['Authorization'] = `Bearer ${configState.apiKey}`;

	// Custom Headers
	if (configState.customHeaders && configState.customHeaders !== '{}') {
		try {
			const custom = JSON.parse(configState.customHeaders);
			Object.assign(headers, custom);
		} catch (e) {
			console.error('Failed to parse custom headers:', e);
		}
	}

	// Add empty assistant message for streaming
	const assistantMsgId = Date.now().toString() + Math.random().toString(36).substring(7);
	chatState.messages.push({
		id: assistantMsgId,
		role: 'assistant',
		content: '',
		timestamp: new Date()
	});

	const updateAssistantMessage = (content: string) => {
		const msg = chatState.messages.find((m) => m.id === assistantMsgId);
		if (msg) msg.content = content;
		saveChatData();
	};

	const setAssistantError = (errorMsg: string) => {
		const msg = chatState.messages.find((m) => m.id === assistantMsgId);
		if (msg) {
			msg.content = `**Error:** ${errorMsg}`;
			msg.isError = true;
		}
		saveChatData();
	};

	let fullText = '';

	try {
		const res = await fetch(`${configState.baseUrl}/chat/completions`, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
			signal: chatState.abortController.signal
		});

		if (!res.ok) {
			const errText = await res.text();
			throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
		}

		if (configState.stream) {
			const reader = res.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) throw new Error('No response body for streaming');

			let buf = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buf += decoder.decode(value, { stream: true });
				const lines = buf.split('\n');
				buf = lines.pop() || '';

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					const raw = line.slice(6).trim();
					if (raw === '[DONE]') break;
					try {
						const chunk = JSON.parse(raw);
						const delta = chunk.choices?.[0]?.delta?.content || '';
						fullText += delta;
						updateAssistantMessage(fullText);
					} catch {}
				}
			}
		} else {
			const data = await res.json();
			fullText = data.choices?.[0]?.message?.content || '';
			updateAssistantMessage(fullText);
		}
	} catch (e: any) {
		if (e.name === 'AbortError') {
			updateAssistantMessage(fullText + '\n\n*(Generation stopped by user)*');
		} else {
			setAssistantError(e.message);
		}
	} finally {
		chatState.isStreaming = false;
		chatState.abortController = null;
	}
};

export const sendMessage = async (text: string) => {
	if (chatState.isStreaming) return;
	if (!text.trim()) return;

	if (!configState.baseUrl || !configState.modelId) {
		showToast('⚠ Configure your API settings first', true);
		uiState.activePage = 'config';
		return;
	}

	addMessage('user', text.trim());
	await triggerGeneration();
};

export const editAndResend = async (id: string, text: string) => {
	if (chatState.isStreaming) return;
	deleteFrom(id);
	await sendMessage(text);
};

export const regenerate = async (id: string) => {
	if (chatState.isStreaming) return;
	deleteFrom(id);
	await triggerGeneration();
};
