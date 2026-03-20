export const uiState = $state<{
	activePage: 'chat' | 'config';
}>({
	activePage: 'chat'
});

export const toastState = $state<{
	show: boolean;
	msg: string;
	isError: boolean;
}>({
	show: false,
	msg: '',
	isError: false
});

let toastTimer: ReturnType<typeof setTimeout>;

export const showToast = (msg: string, isError = false) => {
	toastState.show = true;
	toastState.msg = msg;
	toastState.isError = isError;

	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toastState.show = false;
	}, 3000);
};
