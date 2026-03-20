<script lang="ts">
	import { toastState } from '$lib/stores/ui';
</script>

<div
	class="fixed bottom-7 right-7 bg-chocolate-dark text-white px-5 py-3 rounded-[10px] text-[13.5px] font-medium shadow-[0_6px_24px_rgba(0,0,0,0.25)] flex items-center gap-2 border-l-3 transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] z-[999] {
		$toastState.show ? 'translate-y-0 opacity-100' : 'translate-y-[80px] opacity-0 pointer-events-none'
	} {
		$toastState.isError ? 'border-terracotta' : 'border-mustard'
	}"
>
	{$toastState.msg}
</div>
