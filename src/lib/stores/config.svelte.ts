import { browser } from '$app/environment';

export interface SystemPrompt {
	id: string;
	label: string;
	content: string;
}

export interface AppConfig {
	baseUrl: string;
	apiKey: string;
	modelId: string;
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	stream: boolean;
	sendHistory: boolean;
	systemPromptLibrary: SystemPrompt[];
	customHeaders: string;
}

export const DEFAULT_CONFIG: AppConfig = {
	baseUrl: '',
	apiKey: '',
	modelId: '',
	temperature: 0.7,
	maxTokens: 4096,
	systemPrompt: 'You are a helpful and concise AI assistant.',
	stream: true,
	sendHistory: true,
	systemPromptLibrary: [
		{ id: '1', label: 'Default Assistant', content: 'You are a helpful and concise AI assistant.' },
		{
			id: '2',
			label: 'Code Expert',
			content:
				'You are an expert software engineer. Provide clean, efficient, and well-documented code solutions.'
		},
		{
			id: '3',
			label: 'Creative Writer',
			content: 'You are a creative writer. Help me brainstorm ideas and write engaging stories.'
		}
	],
	customHeaders: '{}'
};

const getInitialConfig = (): AppConfig => {
	if (!browser) return { ...DEFAULT_CONFIG };
	try {
		const saved = localStorage.getItem('gh_chat_cfg');
		if (!saved) return { ...DEFAULT_CONFIG };

		const parsed = JSON.parse(saved);
		// Migration: ensure new fields exist
		return {
			...DEFAULT_CONFIG,
			...parsed,
			systemPromptLibrary: parsed.systemPromptLibrary || DEFAULT_CONFIG.systemPromptLibrary,
			customHeaders: parsed.customHeaders || DEFAULT_CONFIG.customHeaders
		};
	} catch {
		return { ...DEFAULT_CONFIG };
	}
};

export const configState = $state<AppConfig>(getInitialConfig());

export const isConfigured = () =>
	configState.baseUrl.trim() !== '' && configState.modelId.trim() !== '';

export const saveConfigData = () => {
	if (browser) {
		try {
			localStorage.setItem('gh_chat_cfg', JSON.stringify(configState));
		} catch {}
	}
};
