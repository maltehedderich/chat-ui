<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ChatArea from '$lib/components/ChatArea.svelte';
	import InputBar from '$lib/components/InputBar.svelte';
	import ConfigPage from '$lib/components/ConfigPage.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { activePage } from '$lib/stores/ui';
</script>

<svelte:head>
	<title>Golden Hour Chat</title>
</svelte:head>

<main class="flex flex-col h-full bg-transparent text-chocolate w-full overflow-hidden transition-all duration-500">
	<Header />
	
	<div class="flex flex-1 overflow-hidden w-full relative">
		{#if $activePage === 'chat'}
			<div class="absolute inset-0 flex flex-col w-full h-full">
				<ChatArea />
				<InputBar />
			</div>
		{/if}

		{#if $activePage === 'config'}
			<div class="absolute inset-0 flex flex-col w-full h-full bg-transparent z-10">
				<ConfigPage />
			</div>
		{/if}
	</div>

	<Toast />
</main>
