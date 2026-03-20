<script lang="ts">
	import { config, DEFAULT_CONFIG } from '$lib/stores/config';
	import { showToast } from '$lib/stores/ui';
	import { get } from 'svelte/store';

	let tempConfig = $state({ ...$config });
	let testing = $state(false);
	let testStatus = $state<'none' | 'checking' | 'ok' | 'error'>('none');
	let testMsg = $state('');
	let showKey = $state(false);

	const saveConfig = () => {
		config.set({ ...tempConfig });
		showToast('✓ Settings saved');
	};

	const resetDefaults = () => {
		tempConfig = { ...DEFAULT_CONFIG };
		config.set({ ...DEFAULT_CONFIG });
		showToast('Reset to defaults');
	};

	const applyPreset = (e: Event) => {
		const val = (e.target as HTMLSelectElement).value;
		if (!val) return;
		const [, baseUrl, model] = val.split('|');
		tempConfig.baseUrl = baseUrl;
		tempConfig.modelId = model;
	};

	const testConnection = async () => {
		testing = true;
		testStatus = 'checking';
		testMsg = 'Connecting…';

		try {
			const url = tempConfig.baseUrl.replace(/\/$/, '') + '/models';
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (tempConfig.apiKey) headers['Authorization'] = 'Bearer ' + tempConfig.apiKey;

			const res = await fetch(url, { headers });
			if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + (await res.text()).slice(0, 120));

			const data = await res.json();
			const count = data.data ? data.data.length : '?';
			testStatus = 'ok';
			testMsg = `Connected — ${count} model(s) available`;
		} catch (e: any) {
			testStatus = 'error';
			testMsg = e.message || 'Connection failed';
		} finally {
			testing = false;
		}
	};
</script>

<div class="flex-1 overflow-y-auto px-6 py-9 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-beige">
	<div class="max-w-[640px] mx-auto">
		<div class="mb-8">
			<h1 class="font-display text-[30px] text-chocolate-dark mb-1.5">Connection Settings</h1>
			<p class="text-[14px] text-chocolate-mid leading-[1.6]">
				Configure your OpenAI-compatible API endpoint. Works with OpenAI, Azure OpenAI, Ollama, LM
				Studio, vLLM, Together, Groq, and more.
			</p>
		</div>

		<!-- Connection -->
		<div
			class="bg-white/60 backdrop-blur-xl rounded-2xl p-6 mb-5 border border-white/60 shadow-[0_4px_24px_rgba(74,64,58,0.06)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(74,64,58,0.1)] hover:bg-white/70"
		>
			<h2 class="font-display text-[17px] text-chocolate mb-[18px] flex items-center gap-2">
				<div class="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] shrink-0 bg-[rgba(244,169,0,0.15)]">
					🔌
				</div>
				Connection
			</h2>

			<div class="mb-4">
				<label for="baseUrl" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">Base URL</label>
				<input
					id="baseUrl"
					type="text"
					bind:value={tempConfig.baseUrl}
					class="w-full bg-white/50 border-[1.5px] border-white/60 backdrop-blur-sm shadow-inner rounded-[10px] px-[13px] py-[10px] font-body text-[14px] text-chocolate outline-none transition-all duration-300 hover:bg-white/70 focus:bg-white/80 focus:border-mustard focus:shadow-[0_0_15px_rgba(244,169,0,0.15)]"
					placeholder="https://api.openai.com/v1"
				/>
				<div class="text-[12px] text-beige mt-1.5 leading-[1.5]">
					The API base URL. For OpenAI use <code class="font-mono text-[11.5px] bg-beige-pale px-1 rounded">https://api.openai.com/v1</code>. For Ollama use
					<code class="font-mono text-[11.5px] bg-beige-pale px-1 rounded">http://localhost:11434/v1</code>.
				</div>
			</div>

			<div class="mb-4">
				<label for="apiKey" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">API Key</label>
				<div class="relative">
					<input
						id="apiKey"
						type={showKey ? 'text' : 'password'}
						bind:value={tempConfig.apiKey}
						class="w-full bg-white/50 border-[1.5px] border-white/60 backdrop-blur-sm shadow-inner rounded-[10px] pl-[13px] pr-[40px] py-[10px] font-mono text-[14px] tracking-[0.08em] text-chocolate outline-none transition-all duration-300 hover:bg-white/70 focus:bg-white/80 focus:border-mustard focus:shadow-[0_0_15px_rgba(244,169,0,0.15)]"
						placeholder="sk-…  (leave blank if not required)"
					/>
					<button
						class="absolute right-[10px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-beige p-1 transition-colors hover:text-mustard-dim"
						onclick={() => (showKey = !showKey)}
						title="Show/hide key"
					>
						<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
							<path
								d="M10 3C5 3 1 10 1 10s4 7 9 7 9-7 9-7-4-7-9-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
							/>
						</svg>
					</button>
				</div>
				<div class="text-[12px] text-beige mt-1.5 leading-[1.5]">
					Stored locally in your browser only — never sent anywhere except your configured endpoint.
				</div>
			</div>

			<div class="flex items-center gap-2.5 mt-4">
				<button
					class="bg-transparent border-[1.5px] border-beige text-chocolate-mid font-body text-[13px] font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors duration-180 flex items-center gap-1.5 hover:border-mustard hover:text-chocolate"
					onclick={testConnection}
					disabled={testing}
				>
					<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
						<path
							d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z"
						/><path d="M8 4.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 .146.354l2 2a.5.5 0 0 0 .708-.708L8 8.293V4.5z" />
					</svg>
					Test Connection
				</button>
				{#if testStatus !== 'none'}
					<div
						class="w-2 h-2 rounded-full transition-colors duration-300 {testStatus === 'ok'
							? 'bg-[#6bb96b]'
							: testStatus === 'error'
								? 'bg-terracotta'
								: 'bg-mustard animate-[pulse_1s_infinite]'}"
					></div>
					<span class="text-[12.5px] text-chocolate-mid">{testStatus === 'checking' ? 'Connecting...' : testStatus === 'ok' ? testMsg : 'Connection failed'}</span>
				{/if}
			</div>
			{#if testStatus === 'error'}
				<div
					class="bg-[rgba(193,102,107,0.1)] border border-[rgba(193,102,107,0.3)] text-terracotta text-[13px] px-3.5 py-2.5 rounded-lg mt-3"
				>
					{testMsg}
				</div>
			{/if}
		</div>

		<!-- Model -->
		<div
			class="bg-white/60 backdrop-blur-xl rounded-2xl p-6 mb-5 border border-white/60 shadow-[0_4px_24px_rgba(74,64,58,0.06)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(74,64,58,0.1)] hover:bg-white/70"
		>
			<h2 class="font-display text-[17px] text-chocolate mb-[18px] flex items-center gap-2">
				<div class="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] shrink-0 bg-[rgba(193,102,107,0.12)]">
					🧠
				</div>
				Model
			</h2>

			<div class="mb-4">
				<label for="modelId" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">Model ID</label>
				<input
					id="modelId"
					type="text"
					bind:value={tempConfig.modelId}
					class="w-full bg-white/50 border-[1.5px] border-white/60 backdrop-blur-sm shadow-inner rounded-[10px] px-[13px] py-[10px] font-body text-[14px] text-chocolate outline-none transition-all duration-300 hover:bg-white/70 focus:bg-white/80 focus:border-mustard focus:shadow-[0_0_15px_rgba(244,169,0,0.15)]"
					placeholder="gpt-4o"
				/>
				<div class="text-[12px] text-beige mt-1.5 leading-[1.5]">
					Enter the model identifier exactly as required by your provider (e.g. <code>gpt-4o</code>,
					<code>llama3</code>, <code>mistral</code>).
				</div>
			</div>

			<div class="mb-4">
				<label for="presets" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">Quick Presets</label>
				<select
					id="presets"
					onchange={applyPreset}
					class="w-full bg-white/50 border-[1.5px] border-white/60 backdrop-blur-sm shadow-inner rounded-[10px] pl-[13px] pr-[36px] py-[10px] font-body text-[14px] text-chocolate outline-none transition-all duration-300 hover:bg-white/70 focus:bg-white/80 focus:border-mustard focus:shadow-[0_0_15px_rgba(244,169,0,0.15)] appearance-none cursor-pointer bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%236b5c54%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
				>
					<option value="">— Choose a preset —</option>
					<optgroup label="OpenAI">
						<option value="openai|https://api.openai.com/v1|gpt-4o">GPT-4o</option>
						<option value="openai|https://api.openai.com/v1|gpt-4o-mini">GPT-4o mini</option>
						<option value="openai|https://api.openai.com/v1|o1">o1</option>
					</optgroup>
					<optgroup label="Ollama (local)">
						<option value="ollama|http://localhost:11434/v1|llama3">Llama 3</option>
						<option value="ollama|http://localhost:11434/v1|mistral">Mistral</option>
						<option value="ollama|http://localhost:11434/v1|phi3">Phi-3</option>
					</optgroup>
					<optgroup label="LM Studio (local)">
						<option value="lmstudio|http://localhost:1234/v1|local-model">LM Studio local model</option
						>
					</optgroup>
					<optgroup label="Groq">
						<option value="groq|https://api.groq.com/openai/v1|llama3-70b-8192">Llama 3 70B</option>
						<option value="groq|https://api.groq.com/openai/v1|mixtral-8x7b-32768"
							>Mixtral 8×7B</option
						>
					</optgroup>
					<optgroup label="Together AI">
						<option value="together|https://api.together.xyz/v1|meta-llama/Llama-3-8b-chat-hf"
							>Llama 3 8B</option
						>
					</optgroup>
				</select>
			</div>
		</div>

		<!-- Parameters -->
		<div
			class="bg-white/60 backdrop-blur-xl rounded-2xl p-6 mb-5 border border-white/60 shadow-[0_4px_24px_rgba(74,64,58,0.06)] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(74,64,58,0.1)] hover:bg-white/70"
		>
			<h2 class="font-display text-[17px] text-chocolate mb-[18px] flex items-center gap-2">
				<div class="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] shrink-0 bg-[rgba(74,64,58,0.08)]">
					⚙️
				</div>
				Parameters
			</h2>

			<div class="grid grid-cols-2 gap-3 mb-4">
				<div>
					<label for="temperature" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">Temperature</label>
					<div class="flex items-center gap-3">
						<input
							id="temperature"
							type="range"
							bind:value={tempConfig.temperature}
							min="0"
							max="2"
							step="0.01"
							class="flex-1 appearance-none h-1 rounded bg-beige outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mustard [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(244,169,0,0.4)]"
						/>
						<span class="text-[13px] font-semibold text-mustard-dim min-w-[36px] text-right"
							>{tempConfig.temperature.toFixed(2)}</span
						>
					</div>
					<div class="text-[12px] text-beige mt-1.5 leading-[1.5]">
						Randomness. 0 = deterministic, 2 = creative.
					</div>
				</div>
				<div>
					<label for="maxTokens" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">Max Tokens</label>
					<input
						id="maxTokens"
						type="number"
						bind:value={tempConfig.maxTokens}
						min="1"
						max="128000"
						step="1"
						class="w-full bg-white/50 border-[1.5px] border-white/60 backdrop-blur-sm shadow-inner rounded-[10px] px-[13px] py-[10px] font-body text-[14px] text-chocolate outline-none transition-all duration-300 hover:bg-white/70 focus:bg-white/80 focus:border-mustard focus:shadow-[0_0_15px_rgba(244,169,0,0.15)]"
					/>
					<div class="text-[12px] text-beige mt-1.5 leading-[1.5]">Max tokens to generate.</div>
				</div>
			</div>

			<div class="mb-4">
				<label for="systemPrompt" class="block text-[12px] font-semibold text-chocolate-mid uppercase tracking-[0.07em] mb-1.5">System Prompt</label>
				<textarea
					id="systemPrompt"
					bind:value={tempConfig.systemPrompt}
					rows="3"
					class="w-full bg-white/50 border-[1.5px] border-white/60 backdrop-blur-sm shadow-inner rounded-[10px] px-[13px] py-[10px] font-body text-[14px] text-chocolate outline-none resize-y leading-[1.5] transition-all duration-300 hover:bg-white/70 focus:bg-white/80 focus:border-mustard focus:shadow-[0_0_15px_rgba(244,169,0,0.15)]"
					placeholder="You are a helpful assistant…"
				></textarea>
				<div class="text-[12px] text-beige mt-1.5 leading-[1.5]">
					Instructions that precede every conversation.
				</div>
			</div>

			<div class="mt-1.5">
				<label
					class="flex items-center justify-between py-2.5 border-b border-[rgba(212,184,150,0.3)] cursor-pointer"
				>
					<div class="flex-1">
						<strong class="text-[13.5px] font-semibold text-chocolate block">Streaming</strong>
						<span class="text-[12px] text-chocolate-mid">Stream tokens as they are generated</span>
					</div>
					<div class="relative w10 h-[22px] shrink-0 w-[40px]">
						<input type="checkbox" bind:checked={tempConfig.stream} class="sr-only peer" />
						<div
							class="absolute inset-0 bg-beige rounded-full transition-colors duration-200 peer-checked:bg-mustard after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:left-[3px] after:bottom-[3px] after:transition-transform after:duration-200 after:shadow-[0_1px_4px_rgba(0,0,0,0.2)] peer-checked:after:translate-x-[18px]"
						></div>
					</div>
				</label>
				<label class="flex items-center justify-between pt-2.5 cursor-pointer">
					<div class="flex-1">
						<strong class="text-[13.5px] font-semibold text-chocolate block"
							>Send conversation history</strong
						>
						<span class="text-[12px] text-chocolate-mid">Include previous messages for context</span
						>
					</div>
					<div class="relative w10 h-[22px] shrink-0 w-[40px]">
						<input type="checkbox" bind:checked={tempConfig.sendHistory} class="sr-only peer" />
						<div
							class="absolute inset-0 bg-beige rounded-full transition-colors duration-200 peer-checked:bg-mustard after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:left-[3px] after:bottom-[3px] after:transition-transform after:duration-200 after:shadow-[0_1px_4px_rgba(0,0,0,0.2)] peer-checked:after:translate-x-[18px]"
						></div>
					</div>
				</label>
			</div>
		</div>

		<div class="flex justify-end gap-2.5 mt-2">
			<button
				class="bg-white/50 backdrop-blur-sm text-chocolate-mid font-body font-medium text-[14px] px-[18px] py-2.5 border-[1.5px] border-white/60 rounded-[10px] cursor-pointer transition-all duration-300 hover:border-terracotta hover:text-terracotta hover:bg-white/80 hover:shadow-sm active:scale-95"
				onclick={resetDefaults}>Reset to defaults</button
			>
			<button
				class="bg-gradient-to-br from-mustard to-[#e89c00] text-chocolate-dark font-body font-semibold text-[14px] px-6 py-2.5 border-none rounded-[10px] cursor-pointer shadow-[0_4px_16px_rgba(244,169,0,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(244,169,0,0.5)] active:scale-95"
				onclick={saveConfig}>Save Settings</button
			>
		</div>
	</div>
</div>

<style>
	.scrollbar-thin::-webkit-scrollbar {
		width: 5px;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: var(--color-beige);
		border-radius: 10px;
	}
</style>
