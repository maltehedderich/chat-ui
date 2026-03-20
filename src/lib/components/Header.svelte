<script lang="ts">
	import { config } from '$lib/stores/config';
	import { activePage } from '$lib/stores/ui';
	import ChatIcon from '$lib/icons/ChatIcon.svelte';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
</script>

<header class="bg-chocolate-dark/85 backdrop-blur-xl border-b border-white/5 px-6 h-[58px] flex items-center justify-between shrink-0 shadow-[0_4px_20px_var(--shadow-glass)] relative z-10 w-full transition-all duration-300">
	<div class="flex items-center gap-[10px]">
		<div class="w-[30px] h-[30px] bg-mustard rounded-lg flex items-center justify-center text-base">
			✦
		</div>
		<span class="font-display text-[20px] text-white tracking-[0.01em]">
			Golden <span class="text-mustard">Hour</span>
		</span>
	</div>

	<nav class="flex gap-1 absolute left-1/2 -translate-x-1/2">
		<button
			class="flex items-center gap-1.5 font-body text-[13px] font-medium px-3.5 py-[7px] rounded-md cursor-pointer transition-all duration-300 tracking-[0.02em] active:scale-95 {
				$activePage === 'chat'
					? 'bg-mustard/20 text-mustard shadow-inner shadow-mustard/10'
					: 'text-beige/80 hover:bg-mustard/10 hover:text-mustard-light bg-transparent border-none'
			}"
			onclick={() => ($activePage = 'chat')}
		>
			<ChatIcon />
			Chat
		</button>
		<button
			class="flex items-center gap-1.5 font-body text-[13px] font-medium px-3.5 py-[7px] rounded-md cursor-pointer transition-all duration-300 tracking-[0.02em] active:scale-95 {
				$activePage === 'config'
					? 'bg-mustard/20 text-mustard shadow-inner shadow-mustard/10'
					: 'text-beige/80 hover:bg-mustard/10 hover:text-mustard-light bg-transparent border-none'
			}"
			onclick={() => ($activePage = 'config')}
		>
			<SettingsIcon />
			Settings
		</button>
	</nav>

	<button
		class="text-[11px] bg-beige/10 backdrop-blur-sm text-beige px-3 py-1.5 rounded-full border border-beige/15 font-medium cursor-pointer transition-all duration-300 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap hover:border-mustard/50 hover:bg-mustard/10 hover:text-mustard-light hover:shadow-[0_0_10px_rgba(244,169,0,0.2)] active:scale-95"
		title={$config.baseUrl || 'Click to configure'}
		onclick={() => ($activePage = 'config')}
	>
		{$config.modelId || 'No model set'}
	</button>
</header>
