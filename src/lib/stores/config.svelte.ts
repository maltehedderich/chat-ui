import { browser } from '$app/environment';

export interface AppConfig {
	baseUrl: string;
	apiKey: string;
	modelId: string;
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	stream: boolean;
	sendHistory: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
	baseUrl: '',
	apiKey: '',
	modelId: '',
	temperature: 0.7,
	maxTokens: 4096,
	systemPrompt: 'You are a helpful and concise AI assistant.',
	stream: true,
	sendHistory: true
};

const getInitialConfig = (): AppConfig => {
	if (!browser) return { ...DEFAULT_CONFIG };
	try {
		const saved = localStorage.getItem('gh_chat_cfg');
		return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
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
