import { writable } from 'svelte/store';
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
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    modelId: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are a helpful assistant.',
    stream: true,
    sendHistory: true,
};

const getInitialConfig = (): AppConfig => {
    if (!browser) return DEFAULT_CONFIG;
    try {
        const saved = localStorage.getItem('gh_chat_cfg');
        return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
};

export const config = writable<AppConfig>(getInitialConfig());

if (browser) {
    config.subscribe(val => {
        try {
            localStorage.setItem('gh_chat_cfg', JSON.stringify(val));
        } catch {}
    });
}
