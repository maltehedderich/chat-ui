<script lang="ts">
	import { toastState } from '$lib/stores/ui.svelte';
</script>

<div
	class="fixed right-7 bottom-7 z-[999] flex items-center gap-2 rounded-xl border border-l-4 border-white/10 bg-zinc-800 px-5 py-3 text-[13.5px] font-medium text-zinc-100 shadow-2xl transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] {toastState.show
		? 'translate-y-0 opacity-100'
		: 'pointer-events-none translate-y-[80px] opacity-0'} {toastState.isError
		? 'border-red-500'
		: 'border-emerald-500'}"
>
	{toastState.msg}
</div>
