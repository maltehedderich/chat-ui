export const escHtml = (s: string) => {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const mdToBubble = (s: string) => {
	return escHtml(s)
		.replace(
			/```[\w]*\n?([\s\S]*?)```/g,
			(_, c) =>
				`<pre class="bg-beige-pale border border-beige rounded-lg p-3 overflow-x-auto my-2 text-[12.5px]"><code class="font-mono text-[12.5px]">${c.trim()}</code></pre>`
		)
		.replace(/`([^`]+)`/g, (_, c) => `<code class="font-mono text-[12.5px]">${c}</code>`)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/\n/g, '<br>');
};

export const formatTime = (date: Date) => {
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
