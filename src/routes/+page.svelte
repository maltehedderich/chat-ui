<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ChatArea from '$lib/components/ChatArea.svelte';
	import InputBar from '$lib/components/InputBar.svelte';
	import ConfigPage from '$lib/components/ConfigPage.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { uiState } from '$lib/stores/ui.svelte';
	import { isConfigured } from '$lib/stores/config.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!isConfigured()) {
			uiState.activePage = 'config';
		}
	});
</script>

<svelte:head>
	<title>Aura</title>
</svelte:head>

<main
	class="flex h-full w-full flex-col overflow-hidden bg-transparent font-sans text-zinc-300 antialiased transition-all duration-500"
>
	<Header />

	<div class="relative flex w-full flex-1 overflow-hidden">
		{#if uiState.activePage === 'chat'}
			<div class="absolute inset-0 flex h-full w-full flex-col">
				<ChatArea />
				<InputBar />
			</div>
		{/if}

		{#if uiState.activePage === 'config'}
			<div class="absolute inset-0 z-10 flex h-full w-full flex-col bg-transparent">
				<ConfigPage />
			</div>
		{/if}
	</div>

	<Toast />
</main>
