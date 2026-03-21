import { marked, type Tokens } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Custom renderer for code blocks to add a copy button
const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: Tokens.Code) {
	// If language isn't provided, guess or default it
	const language = (lang || 'plaintext').match(/\S+/)?.[0] || 'plaintext';
	let highlightedCode = text;

	try {
		highlightedCode = hljs.highlight(text, {
			language: hljs.getLanguage(language) ? language : 'plaintext'
		}).value;
	} catch (e) {
		// Fallback
	}

	// Use generic language name if not specifically highlighted
	const displayLang = language && language !== 'plaintext' ? language : 'Code';

	return `
		<div class="relative group my-4 rounded-xl border border-white/10 bg-[#1e1e2e] shadow-lg overflow-hidden">
			<div class="flex items-center justify-between bg-[#11111b] px-4 py-2 text-xs text-zinc-400 border-b border-white/5">
				<span class="font-mono uppercase">${displayLang}</span>
				<button class="copy-btn flex items-center gap-1.5 hover:text-indigo-400 transition-colors" data-code="${escHtml(text)}">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
					<span>Copy</span>
				</button>
			</div>
			<pre class="p-4 overflow-x-auto text-[13px] leading-relaxed m-0"><code class="hljs language-${language}">${highlightedCode}</code></pre>
		</div>
	`;
};

// Use the custom renderer
marked.use({ renderer });

export const escHtml = (s: string) => {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

export const mdToBubble = (s: string) => {
	// Parse markdown to HTML
	const rawHtml = marked.parse(s, { async: false }) as string;
	// Sanitize the HTML
	// We allow standard markup plus our custom wrapper classes
	const cleanHtml = DOMPurify.sanitize(rawHtml, {
		ALLOWED_TAGS: [
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'blockquote',
			'p',
			'a',
			'ul',
			'ol',
			'nl',
			'li',
			'b',
			'i',
			'strong',
			'em',
			'strike',
			'code',
			'hr',
			'br',
			'div',
			'table',
			'thead',
			'caption',
			'tbody',
			'tr',
			'th',
			'td',
			'pre',
			'span',
			'button',
			'svg',
			'rect',
			'path'
		],
		ALLOWED_ATTR: [
			'href',
			'name',
			'target',
			'class',
			'data-code',
			'xmlns',
			'viewBox',
			'fill',
			'stroke',
			'stroke-width',
			'stroke-linecap',
			'stroke-linejoin',
			'width',
			'height',
			'x',
			'y',
			'rx',
			'ry',
			'd'
		]
	});
	return cleanHtml;
};

export const formatTime = (date: Date) => {
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const downloadMarkdown = (messages: any[]) => {
	if (messages.length === 0) return;

	let content = '# Aura AI Chat Export\n\n';
	messages.forEach((m) => {
		const role = m.role.charAt(0).toUpperCase() + m.role.slice(1);
		const time = formatTime(new Date(m.timestamp));
		content += `### **${role}** (${time})\n${m.content}\n\n---\n\n`;
	});

	const blob = new Blob([content], { type: 'text/markdown' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `aura-chat-${new Date().toISOString().split('T')[0]}.md`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};
