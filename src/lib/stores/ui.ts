import { writable } from 'svelte/store';

export const activePage = writable<'chat' | 'config'>('chat');

export const toastState = writable<{show: boolean, msg: string, isError: boolean}>({
    show: false,
    msg: '',
    isError: false
});

let toastTimer: ReturnType<typeof setTimeout>;

export const showToast = (msg: string, isError = false) => {
    toastState.set({ show: true, msg, isError });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastState.update(t => ({ ...t, show: false }));
    }, 3000);
};

