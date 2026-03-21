<script lang="ts">
	import { configState, DEFAULT_CONFIG, saveConfigData } from '$lib/stores/config.svelte';
	import { showToast } from '$lib/stores/ui.svelte';

	let tempConfig = $state({ ...configState });
	let testing = $state(false);
	let testStatus = $state<'none' | 'checking' | 'ok' | 'error'>('none');
	let testMsg = $state('');
	let showKey = $state(false);
	const headersPlaceholder = '{"X-Custom-Header": "Value"}';

	// Prompt library logic
	let newPromptLabel = $state('');
	let newPromptContent = $state('');

	const addPromptToLibrary = () => {
		if (!newPromptLabel.trim() || !newPromptContent.trim()) return;
		tempConfig.systemPromptLibrary.push({
			id: Date.now().toString() + Math.random().toString(36).substring(7),
			label: newPromptLabel.trim(),
			content: newPromptContent.trim()
		});
		newPromptLabel = '';
		newPromptContent = '';
		showToast('Prompt added to library');
	};

	const removePromptFromLibrary = (id: string) => {
		tempConfig.systemPromptLibrary = tempConfig.systemPromptLibrary.filter((p) => p.id !== id);
	};

	const selectPrompt = (content: string) => {
		tempConfig.systemPrompt = content;
		showToast('Prompt applied');
	};

	const saveConfig = () => {
		// Basic JSON validation for headers
		try {
			if (
				tempConfig.customHeaders &&
				tempConfig.customHeaders.trim() &&
				tempConfig.customHeaders !== '{}'
			) {
				JSON.parse(tempConfig.customHeaders);
			}
		} catch (e) {
			showToast('⚠ Invalid JSON in Custom Headers', true);
			return;
		}

		Object.assign(configState, tempConfig);
		saveConfigData();
		showToast('✓ Settings saved');
	};

	const resetDefaults = () => {
		tempConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
		Object.assign(configState, DEFAULT_CONFIG);
		saveConfigData();
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

			// Include custom headers in test if valid
			if (
				tempConfig.customHeaders &&
				tempConfig.customHeaders.trim() &&
				tempConfig.customHeaders !== '{}'
			) {
				try {
					const custom = JSON.parse(tempConfig.customHeaders);
					Object.assign(headers, custom);
				} catch {}
			}

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

<div
	class="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 flex-1 overflow-y-auto px-6 py-9"
>
	<div class="mx-auto max-w-[640px]">
		<div class="mb-8">
			<h1 class="font-display mb-1.5 text-[30px] text-zinc-100">Connection Settings</h1>
			<p class="text-[14px] leading-[1.6] text-zinc-400">
				Configure your OpenAI-compatible API endpoint. Works with OpenAI, Azure OpenAI, Ollama, LM
				Studio, vLLM, Together, Groq, and more.
			</p>
		</div>

		<!-- Connection -->
		<div
			class="mb-5 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-500 hover:bg-zinc-900/60 hover:shadow-xl"
		>
			<h2 class="font-display mb-[18px] flex items-center gap-2 text-[17px] text-zinc-100">
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-[14px] text-indigo-300"
				>
					🔌
				</div>
				Connection
			</h2>

			<div class="mb-4">
				<label
					for="baseUrl"
					class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>Base URL</label
				>
				<input
					id="baseUrl"
					type="text"
					bind:value={tempConfig.baseUrl}
					class="font-body w-full rounded-[10px] border border-white/10 bg-zinc-950/50 px-[13px] py-[10px] text-[14px] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
					placeholder="https://api.openai.com/v1"
				/>
				<div class="mt-1.5 text-[12px] leading-[1.5] text-zinc-500">
					The API base URL. For OpenAI use <code
						class="rounded bg-zinc-800 px-1 font-mono text-[11.5px]">https://api.openai.com/v1</code
					>. For Ollama use
					<code class="rounded bg-zinc-800 px-1 font-mono text-[11.5px]"
						>http://localhost:11434/v1</code
					>.
				</div>
			</div>

			<div class="mb-4">
				<label
					for="apiKey"
					class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>API Key</label
				>
				<div class="relative">
					<input
						id="apiKey"
						type={showKey ? 'text' : 'password'}
						bind:value={tempConfig.apiKey}
						class="w-full rounded-[10px] border border-white/10 bg-zinc-950/50 py-[10px] pr-[40px] pl-[13px] font-mono text-[14px] tracking-[0.08em] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
						placeholder="sk-…  (leave blank if not required)"
					/>
					<button
						class="absolute top-1/2 right-[10px] -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-zinc-500 transition-colors hover:text-indigo-400"
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
				<div class="mt-1.5 text-[12px] leading-[1.5] text-zinc-500">
					Stored locally in your browser only — never sent anywhere except your configured endpoint.
				</div>
			</div>

			<div class="mb-4">
				<label
					for="customHeaders"
					class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>Custom Headers (JSON)</label
				>
				<textarea
					id="customHeaders"
					bind:value={tempConfig.customHeaders}
					rows="2"
					class="font-body w-full rounded-[10px] border border-white/10 bg-zinc-950/50 px-[13px] py-[10px] font-mono text-[13px] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
					placeholder={headersPlaceholder}
				></textarea>
				<div class="mt-1.5 text-[12px] leading-[1.5] text-zinc-500">
					Additional HTTP headers to send with every request. Must be valid JSON.
				</div>
			</div>

			<div class="mt-4 flex items-center gap-2.5">
				<button
					class="font-body flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-4 py-2 text-[13px] font-medium text-zinc-300 transition-colors duration-180 hover:border-indigo-500 hover:text-indigo-300"
					onclick={testConnection}
					disabled={testing}
				>
					<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
						<path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" /><path
							d="M8 4.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 .146.354l2 2a.5.5 0 0 0 .708-.708L8 8.293V4.5z"
						/>
					</svg>
					Test Connection
				</button>
				{#if testStatus !== 'none'}
					<div
						class="h-2 w-2 rounded-full transition-colors duration-300 {testStatus === 'ok'
							? 'bg-emerald-500'
							: testStatus === 'error'
								? 'bg-rose-500'
								: 'animate-[pulse_1s_infinite] bg-indigo-500'}"
					></div>
					<span class="text-[12.5px] text-zinc-300"
						>{testStatus === 'checking'
							? 'Connecting...'
							: testStatus === 'ok'
								? testMsg
								: 'Connection failed'}</span
					>
				{/if}
			</div>
			{#if testStatus === 'error'}
				<div
					class="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-400"
				>
					{testMsg}
				</div>
			{/if}
		</div>

		<!-- Model -->
		<div
			class="mb-5 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-500 hover:bg-zinc-900/60 hover:shadow-xl"
		>
			<h2 class="font-display mb-[18px] flex items-center gap-2 text-[17px] text-zinc-100">
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-[14px] text-violet-300"
				>
					🧠
				</div>
				Model
			</h2>

			<div class="mb-4">
				<label
					for="modelId"
					class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>Model ID</label
				>
				<input
					id="modelId"
					type="text"
					bind:value={tempConfig.modelId}
					class="font-body w-full rounded-[10px] border border-white/10 bg-zinc-950/50 px-[13px] py-[10px] text-[14px] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
					placeholder="gpt-4o"
				/>
				<div class="mt-1.5 text-[12px] leading-[1.5] text-zinc-500">
					Enter the model identifier exactly as required by your provider (e.g. <code>gpt-4o</code>,
					<code>llama3</code>, <code>mistral</code>).
				</div>
			</div>

			<div class="mb-4">
				<label
					for="presets"
					class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>Quick Presets</label
				>
				<select
					id="presets"
					onchange={applyPreset}
					class="font-body w-full cursor-pointer appearance-none rounded-[10px] border border-white/10 bg-zinc-950/50 bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%23a1a1aa%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-[right_12px_center] bg-no-repeat py-[10px] pr-[36px] pl-[13px] text-[14px] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
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
						<option value="lmstudio|http://localhost:1234/v1|local-model"
							>LM Studio local model</option
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
			class="mb-5 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-500 hover:bg-zinc-900/60 hover:shadow-xl"
		>
			<h2 class="font-display mb-[18px] flex items-center gap-2 text-[17px] text-zinc-100">
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-500/20 text-[14px] text-zinc-300"
				>
					⚙️
				</div>
				Parameters
			</h2>

			<div class="mb-4 grid grid-cols-2 gap-3">
				<div>
					<label
						for="temperature"
						class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
						>Temperature</label
					>
					<div class="flex items-center gap-3">
						<input
							id="temperature"
							type="range"
							bind:value={tempConfig.temperature}
							min="0"
							max="2"
							step="0.01"
							class="h-1 flex-1 appearance-none rounded bg-zinc-800 outline-none [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(99,102,241,0.4)]"
						/>
						<span class="min-w-[36px] text-right text-[13px] font-semibold text-indigo-400"
							>{tempConfig.temperature.toFixed(2)}</span
						>
					</div>
					<div class="mt-1.5 text-[12px] leading-[1.5] text-zinc-500">
						Randomness. 0 = deterministic, 2 = creative.
					</div>
				</div>
				<div>
					<label
						for="maxTokens"
						class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
						>Max Tokens</label
					>
					<input
						id="maxTokens"
						type="number"
						bind:value={tempConfig.maxTokens}
						min="1"
						max="128000"
						step="1"
						class="font-body w-full rounded-[10px] border border-white/10 bg-zinc-950/50 px-[13px] py-[10px] text-[14px] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
					/>
					<div class="mt-1.5 text-[12px] leading-[1.5] text-zinc-500">Max tokens to generate.</div>
				</div>
			</div>

			<div class="mb-4">
				<label
					for="systemPrompt"
					class="mb-1.5 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>Active System Prompt</label
				>
				<textarea
					id="systemPrompt"
					bind:value={tempConfig.systemPrompt}
					rows="3"
					class="font-body w-full resize-y rounded-[10px] border border-white/10 bg-zinc-950/50 px-[13px] py-[10px] text-[14px] leading-[1.5] text-zinc-100 shadow-inner backdrop-blur-sm transition-all duration-300 outline-none hover:bg-zinc-900 focus:border-indigo-500 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
					placeholder="You are a helpful assistant…"
				></textarea>
			</div>

			<div class="mb-6">
				<span class="mb-2 block text-[12px] font-semibold tracking-[0.07em] text-zinc-400 uppercase"
					>Prompt Library</span
				>
				<div class="flex flex-col gap-2">
					{#each tempConfig.systemPromptLibrary as prompt (prompt.id)}
						<div
							class="group flex items-center justify-between rounded-lg border border-white/5 bg-zinc-950/30 p-2.5 transition-all hover:bg-zinc-950/50"
						>
							<div class="flex flex-col overflow-hidden">
								<span class="text-[13px] font-medium text-zinc-200">{prompt.label}</span>
								<span class="truncate text-[11px] text-zinc-500">{prompt.content}</span>
							</div>
							<div
								class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<button
									class="cursor-pointer rounded p-1 text-zinc-500 hover:bg-indigo-500/10 hover:text-indigo-400"
									onclick={() => selectPrompt(prompt.content)}
									title="Use this prompt"
								>
									<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
										<path
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										/>
									</svg>
								</button>
								<button
									class="cursor-pointer rounded p-1 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
									onclick={() => removePromptFromLibrary(prompt.id)}
									title="Delete"
								>
									<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-4 rounded-xl border border-white/5 bg-zinc-950/20 p-4">
					<span class="mb-3 block text-[11px] font-semibold text-zinc-500 uppercase"
						>Add New Prompt</span
					>
					<div class="flex flex-col gap-3">
						<input
							type="text"
							bind:value={newPromptLabel}
							placeholder="Label (e.g. Code Expert)"
							class="w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-indigo-500"
						/>
						<textarea
							bind:value={newPromptContent}
							placeholder="Prompt content..."
							rows="2"
							class="w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-indigo-500"
						></textarea>
						<button
							class="self-end rounded-lg bg-indigo-500/10 px-4 py-2 text-[12px] font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
							onclick={addPromptToLibrary}
						>
							+ Add to Library
						</button>
					</div>
				</div>
			</div>

			<div class="mt-1.5">
				<label
					class="flex cursor-pointer items-center justify-between border-b border-white/10 py-2.5"
				>
					<div class="flex-1">
						<strong class="block text-[13.5px] font-semibold text-zinc-100">Streaming</strong>
						<span class="text-[12px] text-zinc-400">Stream tokens as they are generated</span>
					</div>
					<div class="relative h-[22px] w-[40px] shrink-0">
						<input type="checkbox" bind:checked={tempConfig.stream} class="peer sr-only" />
						<div
							class="absolute inset-0 rounded-full bg-zinc-700 transition-colors duration-200 peer-checked:bg-indigo-500 after:absolute after:bottom-[3px] after:left-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-[0_1px_4px_rgba(0,0,0,0.2)] after:transition-transform after:duration-200 peer-checked:after:translate-x-[18px]"
						></div>
					</div>
				</label>
				<label class="flex cursor-pointer items-center justify-between pt-2.5">
					<div class="flex-1">
						<strong class="block text-[13.5px] font-semibold text-zinc-100"
							>Send conversation history</strong
						>
						<span class="text-[12px] text-zinc-400">Include previous messages for context</span>
					</div>
					<div class="relative h-[22px] w-[40px] shrink-0">
						<input type="checkbox" bind:checked={tempConfig.sendHistory} class="peer sr-only" />
						<div
							class="absolute inset-0 rounded-full bg-zinc-700 transition-colors duration-200 peer-checked:bg-indigo-500 after:absolute after:bottom-[3px] after:left-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-[0_1px_4px_rgba(0,0,0,0.2)] after:transition-transform after:duration-200 peer-checked:after:translate-x-[18px]"
						></div>
					</div>
				</label>
			</div>
		</div>

		<div class="mt-2 flex justify-end gap-2.5">
			<button
				class="font-body cursor-pointer rounded-[10px] border border-white/10 bg-transparent px-[18px] py-2.5 text-[14px] font-medium text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
				onclick={resetDefaults}>Reset to defaults</button
			>
			<button
				class="font-body cursor-pointer rounded-[10px] border-none bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] active:scale-95"
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
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}
</style>
