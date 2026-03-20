<script lang="ts">
	import { configState } from '$lib/stores/config.svelte';
	import { uiState } from '$lib/stores/ui.svelte';
	import ChatIcon from '$lib/icons/ChatIcon.svelte';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
</script>

<header
	class="relative z-10 flex h-[64px] w-full shrink-0 items-center justify-between border-b border-white/5 bg-zinc-950/40 px-6 shadow-lg backdrop-blur-2xl transition-all duration-300"
>
	<div class="flex items-center gap-[12px]">
		<div
			class="flex h-[32px] w-[32px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[15px] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
		>
			✦
		</div>
		<span class="font-sans text-[19px] font-semibold tracking-tight text-zinc-100">
			Aura <span class="font-medium text-indigo-400">AI</span>
		</span>
	</div>

	<nav
		class="absolute left-1/2 flex -translate-x-1/2 gap-1 rounded-lg border border-white/5 bg-zinc-900/50 p-1"
	>
		<button
			class="flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-[6px] font-sans text-[13px] font-medium tracking-wide transition-all duration-300 active:scale-95 {uiState.activePage ===
			'chat'
				? 'bg-white/10 text-white shadow-inner shadow-white/5'
				: 'border-none bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}"
			onclick={() => (uiState.activePage = 'chat')}
		>
			<ChatIcon />
			Chat
		</button>
		<button
			class="flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-[6px] font-sans text-[13px] font-medium tracking-wide transition-all duration-300 active:scale-95 {uiState.activePage ===
			'config'
				? 'bg-white/10 text-white shadow-inner shadow-white/5'
				: 'border-none bg-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}"
			onclick={() => (uiState.activePage = 'config')}
		>
			<SettingsIcon />
			Settings
		</button>
	</nav>

	<button
		class="max-w-[180px] cursor-pointer overflow-hidden rounded-full border border-white/10 bg-zinc-800/50 px-3.5 py-1.5 text-[12px] font-medium text-ellipsis whitespace-nowrap text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-95"
		title={configState.baseUrl || 'Click to configure'}
		onclick={() => (uiState.activePage = 'config')}
	>
		{configState.modelId || 'No model set'}
	</button>
</header>
