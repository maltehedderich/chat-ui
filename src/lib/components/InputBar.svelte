<script lang="ts">
	import { chatState } from '$lib/stores/chat.svelte';
	import { sendMessage, stopStreaming } from '$lib/api';
	import SendIcon from '$lib/icons/SendIcon.svelte';

	let inputVal = $state('');
	let charCount = $derived(inputVal.length > 0 ? inputVal.length.toString() : '');
	let textareaEl: HTMLTextAreaElement;

	const onInput = () => {
		textareaEl.style.height = 'auto';
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, 140) + 'px';
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSend = () => {
		if (chatState.isStreaming || !inputVal.trim()) return;
		sendMessage(inputVal);
		inputVal = '';
		if (textareaEl) textareaEl.style.height = 'auto';
	};
</script>

<div
	class="z-10 shrink-0 border-t border-white/5 bg-zinc-950/60 px-6 py-4 shadow-[0_-4px_30px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-all duration-300"
>
	<div class="mx-auto flex max-w-[760px] flex-col gap-1.5">
		<div class="flex items-end gap-2.5">
			<div
				class="flex flex-1 items-end gap-2 rounded-2xl border border-white/10 bg-zinc-900/40 px-3.5 py-2.5 shadow-inner backdrop-blur-md transition-all duration-300 focus-within:border-indigo-500/50 focus-within:bg-zinc-900/60 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-white/20"
			>
				<textarea
					bind:this={textareaEl}
					bind:value={inputVal}
					oninput={onInput}
					onkeydown={onKeyDown}
					class="max-h-[160px] min-h-[24px] flex-1 resize-none border-none bg-transparent font-sans text-[14.5px] leading-[1.6] text-zinc-200 outline-none placeholder:text-zinc-500"
					placeholder="Message Aura..."
					rows="1"
				></textarea>
				<span
					class="self-end rounded bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-zinc-500 opacity-0 transition-opacity duration-300 {inputVal.length >
					0
						? 'opacity-100'
						: ''}">{charCount}</span
				>
			</div>

			{#if chatState.isStreaming}
				<button
					class="flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border-none bg-zinc-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.05] hover:bg-rose-600/90 hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] active:scale-95"
					onclick={stopStreaming}
					title="Stop Generation"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="stroke-white"
					>
						<rect x="6" y="6" width="12" height="12" rx="1" ry="1" />
					</svg>
				</button>
			{:else}
				<button
					class="flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border-none bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] active:scale-95 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-30 [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-white"
					onclick={handleSend}
					disabled={!inputVal.trim()}
					title="Send"
				>
					<SendIcon />
				</button>
			{/if}
		</div>
		<div class="flex items-center justify-center px-1">
			<span class="text-[11px] text-zinc-500">Enter to send · Shift+Enter for new line</span>
		</div>
	</div>
</div>
