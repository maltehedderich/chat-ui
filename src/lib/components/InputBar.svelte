<script lang="ts">
	import { isStreaming, clearChat } from '$lib/stores/chat';
	import { sendMessage } from '$lib/api';
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
		if ($isStreaming || !inputVal.trim()) return;
		sendMessage(inputVal);
		inputVal = '';
		textareaEl.style.height = 'auto';
	};
</script>

<div class="bg-white/40 backdrop-blur-xl border-t border-white/40 shadow-[0_-4px_30px_rgba(244,169,0,0.05)] px-6 py-4 shrink-0 transition-all duration-300">
	<div class="max-w-[760px] mx-auto flex gap-2.5 items-end">
		<div
			class="flex-1 bg-white/60 backdrop-blur-md shadow-inner border-[1.5px] border-white/50 rounded-[16px] transition-all duration-300 flex items-end px-3.5 py-2.5 gap-2 focus-within:border-mustard focus-within:bg-white/80 focus-within:shadow-[0_0_20px_rgba(244,169,0,0.15)] hover:shadow-md"
		>
			<textarea
				bind:this={textareaEl}
				bind:value={inputVal}
				oninput={onInput}
				onkeydown={onKeyDown}
				class="flex-1 bg-transparent border-none outline-none font-body text-[14px] text-chocolate resize-none max-h-[140px] leading-[1.5] min-h-[22px] placeholder:text-beige"
				placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
				rows="1"
			></textarea>
			<span class="text-[10px] text-chocolate-mid/70 whitespace-nowrap self-end font-medium bg-white/40 px-1.5 py-0.5 rounded opacity-0 transition-opacity duration-300 {inputVal.length > 0 ? 'opacity-100' : ''}">{charCount}</span>
		</div>
		<button
			class="w-[44px] h-[44px] bg-gradient-to-br from-mustard to-[#e89c00] border-none rounded-[14px] cursor-pointer flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(244,169,0,0.35)] shrink-0 hover:scale-[1.08] hover:shadow-[0_6px_20px_rgba(244,169,0,0.5)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none [&>svg]:fill-chocolate-dark [&>svg]:w-[18px] [&>svg]:h-[18px]"
			onclick={handleSend}
			disabled={$isStreaming || !inputVal.trim()}
			title="Send"
		>
			<SendIcon />
		</button>
	</div>
	<div class="max-w-[760px] mx-auto mt-1.5 flex justify-between items-center">
		<span class="text-[11px] text-beige">Enter to send · Shift+Enter for new line</span>
		<button
			class="bg-transparent border-none text-chocolate-mid/60 text-[11px] cursor-pointer font-body px-2 py-1 rounded transition-all duration-300 hover:text-terracotta hover:bg-terracotta/10 active:scale-95"
			onclick={clearChat}
		>
			Clear chat
		</button>
	</div>
</div>
