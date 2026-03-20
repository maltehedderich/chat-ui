<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import { sendMessage } from '$lib/api';
	import { mdToBubble, formatTime } from '$lib/utils';
	import { onMount, tick } from 'svelte';

	let chatContainer: HTMLDivElement;
	let lastMessageCount = 0;

	$effect(() => {
		if (chatContainer && chatState.messages.length >= lastMessageCount) {
			tick().then(() => {
				if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
			});
		}
		lastMessageCount = chatState.messages.length;
	});

	const suggestions = [
		'Explain quantum computing',
		'Write a haiku about autumn',
		'Summarise the history of Rome',
		'Debug my Python code'
	];
</script>

<div
	class="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 flex-1 overflow-y-auto scroll-smooth py-7"
	bind:this={chatContainer}
>
	<div class="mx-auto flex max-w-[760px] flex-col gap-5 px-6 pb-8">
		{#if chatState.messages.length === 0}
			<div class="flex flex-col items-center justify-center gap-4 p-[80px_24px] text-center">
				<div
					class="flex h-16 w-16 cursor-default items-center justify-center rounded-[20px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[28px] text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-transform duration-500 hover:scale-105"
				>
					✦
				</div>
				<h2 class="font-display mt-2 text-[26px] text-zinc-100">Start a Conversation</h2>
				<p class="max-w-[320px] text-[14px] leading-[1.6] text-zinc-400">
					Connect to any OpenAI-compatible API and start chatting. Configure your endpoint in
					Settings first.
				</p>
				<div class="mt-2 flex flex-wrap justify-center gap-2">
					{#each suggestions as suggestion}
						<button
							class="font-body cursor-pointer rounded-[20px] border border-white/10 bg-zinc-900/50 px-4 py-2.5 text-[12.5px] text-zinc-300 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-zinc-800/80 hover:text-indigo-300 hover:shadow-md active:scale-95"
							onclick={() => sendMessage(suggestion)}
						>
							{suggestion}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			{#each chatState.messages as msg (msg.id)}
				<div class="flex animate-msg-in gap-3 {msg.role === 'user' ? 'flex-row-reverse' : ''}">
					<div
						class="mt-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[12px] text-[15px] shadow-md transition-transform duration-300 hover:scale-110 {msg.role ===
						'user'
							? 'font-body bg-gradient-to-br from-indigo-600 to-violet-600 text-[12px] font-bold text-white'
							: msg.isError
								? 'bg-rose-500/15 text-rose-400'
								: 'bg-zinc-800 text-indigo-400'}"
					>
						{msg.role === 'user' ? 'You' : msg.isError ? '!' : '✦'}
					</div>
					<div>
						<div
							class="max-w-[85%] rounded-2xl px-5 py-[15px] text-[14.5px] leading-[1.65] transition-all duration-300 hover:shadow-lg sm:max-w-[78%] {msg.role ===
							'user'
								? 'rounded-br-sm bg-gradient-to-br from-indigo-600 to-violet-600 font-medium text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]'
								: msg.isError
									? 'rounded-bl-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 backdrop-blur'
									: 'rounded-bl-sm border border-white/10 bg-zinc-900/60 text-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-lg hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)]'}"
						>
							{#if msg.role === 'assistant' && msg.content === '' && chatState.isStreaming}
								<!-- Typing indicator -->
								<div class="flex h-[24px] items-center gap-[5px]">
									<div
										class="h-[7px] w-[7px] animate-[bounce_1.2s_infinite] rounded-full bg-zinc-500"
									></div>
									<div
										class="h-[7px] w-[7px] animate-[bounce_1.2s_infinite] rounded-full bg-zinc-500"
										style="animation-delay: 0.2s"
									></div>
									<div
										class="h-[7px] w-[7px] animate-[bounce_1.2s_infinite] rounded-full bg-zinc-500"
										style="animation-delay: 0.4s"
									></div>
								</div>
							{:else}
								{@html msg.role === 'user' ? mdToBubble(msg.content) : mdToBubble(msg.content)}
							{/if}
						</div>
						<div
							class="mt-1.5 text-[10.5px] text-zinc-500 {msg.role === 'user'
								? 'text-right'
								: 'text-left'}"
						>
							{formatTime(msg.timestamp)}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
