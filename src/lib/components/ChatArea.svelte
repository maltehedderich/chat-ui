<script lang="ts">
	import { messages, isStreaming } from '$lib/stores/chat';
	import { sendMessage } from '$lib/api';
	import { mdToBubble, formatTime } from '$lib/utils';
	import { onMount, tick } from 'svelte';

	let chatContainer: HTMLDivElement;
	let lastMessageCount = 0;

	// Scroll to bottom when messages update
	messages.subscribe(async (msgs) => {
		if (chatContainer && msgs.length >= lastMessageCount) {
			await tick();
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
		lastMessageCount = msgs.length;
	});

	const suggestions = [
		'Explain quantum computing',
		'Write a haiku about autumn',
		'Summarise the history of Rome',
		'Debug my Python code'
	];
</script>

<div class="flex-1 overflow-y-auto py-7 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-beige" bind:this={chatContainer}>
	<div class="max-w-[760px] mx-auto px-6 flex flex-col gap-5 pb-8">
		{#if $messages.length === 0}
			<div class="flex flex-col items-center justify-center p-[80px_24px] text-center gap-4">
				<div
					class="w-16 h-16 bg-gradient-to-br from-mustard to-terracotta rounded-[20px] flex items-center justify-center text-[28px] shadow-[0_10px_30px_rgba(244,169,0,0.3)] text-white hover:scale-105 transition-transform duration-500 cursor-default"
				>
					✦
				</div>
				<h2 class="font-display text-[26px] text-chocolate mt-2">Start a Conversation</h2>
				<p class="text-[14px] text-chocolate-mid max-w-[320px] leading-[1.6]">
					Connect to any OpenAI-compatible API and start chatting. Configure your endpoint in
					Settings first.
				</p>
				<div class="flex flex-wrap gap-2 justify-center mt-2">
					{#each suggestions as suggestion}
						<button
							class="bg-white/50 backdrop-blur-md border-[1.5px] border-white/60 text-chocolate-mid text-[12.5px] px-4 py-2.5 rounded-[20px] cursor-pointer transition-all duration-300 font-body shadow-sm hover:border-mustard/50 hover:text-chocolate hover:bg-white/80 hover:-translate-y-1 hover:shadow-md active:scale-95"
							onclick={() => sendMessage(suggestion)}
						>
							{suggestion}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			{#each $messages as msg (msg.id)}
				<div
					class="flex gap-3 animate-[msgIn_0.22s_ease-out] {
						msg.role === 'user' ? 'flex-row-reverse' : ''
					}"
				>
					<div
						class="w-[34px] h-[34px] rounded-[12px] flex items-center justify-center text-[15px] shrink-0 mt-0.5 shadow-md transition-transform hover:scale-110 duration-300 {
							msg.role === 'user'
								? 'bg-gradient-to-br from-mustard to-mustard-dim text-chocolate-dark font-bold text-[12px] font-body'
								: msg.isError
									? 'bg-[rgba(193,102,107,0.15)] text-terracotta'
									: 'bg-chocolate-dark text-mustard'
						}"
					>
						{msg.role === 'user' ? 'You' : msg.isError ? '!' : '✦'}
					</div>
					<div>
						<div
							class="max-w-[85%] sm:max-w-[78%] px-5 py-[15px] rounded-2xl text-[14.5px] leading-[1.65] transition-all duration-300 hover:shadow-lg {
								msg.role === 'user'
									? 'bg-gradient-to-br from-mustard to-[#e89c00] text-chocolate-dark rounded-br-sm shadow-[0_4px_16px_rgba(244,169,0,0.3)] hover:shadow-[0_6px_20px_rgba(244,169,0,0.4)] font-medium'
									: msg.isError
										? 'border border-[rgba(193,102,107,0.3)] bg-[rgba(193,102,107,0.06)] backdrop-blur text-terracotta rounded-bl-sm'
										: 'bg-white/70 backdrop-blur-lg text-chocolate rounded-bl-sm shadow-[0_4px_20px_rgba(74,64,58,0.08)] hover:shadow-[0_6px_24px_rgba(74,64,58,0.12)] border border-white/60'
							}"
						>
							{#if msg.role === 'assistant' && msg.content === '' && $isStreaming}
								<!-- Typing indicator -->
								<div class="flex items-center gap-[5px] h-[24px]">
									<div class="w-[7px] h-[7px] bg-beige rounded-full animate-[bounce_1.2s_infinite]"></div>
									<div
										class="w-[7px] h-[7px] bg-beige rounded-full animate-[bounce_1.2s_infinite]"
										style="animation-delay: 0.2s"
									></div>
									<div
										class="w-[7px] h-[7px] bg-beige rounded-full animate-[bounce_1.2s_infinite]"
										style="animation-delay: 0.4s"
									></div>
								</div>
							{:else}
								{@html msg.role === 'user' ? mdToBubble(msg.content) : mdToBubble(msg.content)}
							{/if}
						</div>
						<div
							class="text-[10.5px] text-beige mt-1.5 {
								msg.role === 'user' ? 'text-right' : 'text-left'
							}"
						>
							{formatTime(msg.timestamp)}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	@keyframes msgIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.5;
		}
		30% {
			transform: translateY(-5px);
			opacity: 1;
		}
	}
	.scrollbar-thin::-webkit-scrollbar {
		width: 5px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: var(--color-beige);
		border-radius: 10px;
	}
</style>
