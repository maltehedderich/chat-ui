import { get } from 'svelte/store';
import { messages, addMessage, isStreaming, type Message } from '$lib/stores/chat';
import { config } from '$lib/stores/config';
import { showToast, activePage } from '$lib/stores/ui';

export const sendMessage = async (text: string) => {
    if (get(isStreaming)) return;
    if (!text.trim()) return;

    const currentConfig = get(config);
    if (!currentConfig.baseUrl || !currentConfig.modelId) {
        showToast('⚠ Configure your API settings first', true);
        activePage.set('config');
        return;
    }

    // Add user message
    addMessage('user', text.trim());
    isStreaming.set(true);

    // Prepare payload
    const payload = {
        model: currentConfig.modelId,
        temperature: currentConfig.temperature,
        max_tokens: currentConfig.maxTokens,
        stream: currentConfig.stream,
        messages: [
            { role: 'system', content: currentConfig.systemPrompt },
            ...(currentConfig.sendHistory 
                ? get(messages).map(m => ({ role: m.role, content: m.content })) 
                : [{ role: 'user', content: text.trim() }])
        ]
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentConfig.apiKey) headers['Authorization'] = `Bearer ${currentConfig.apiKey}`;

    // Add empty assistant message for streaming
    const assistantMsgId = Date.now().toString() + Math.random().toString(36).substring(7);
    messages.update(msgs => [
        ...msgs,
        {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date()
        }
    ]);

    const updateAssistantMessage = (content: string) => {
        messages.update(msgs => msgs.map(m => m.id === assistantMsgId ? { ...m, content } : m));
    };

    const setAssistantError = (errorMsg: string) => {
        messages.update(msgs => msgs.map(m => m.id === assistantMsgId ? { ...m, content: `**Error:** ${errorMsg}`, isError: true } : m));
    };

    let fullText = '';
    
    try {
        const res = await fetch(`${currentConfig.baseUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
        }

        if (currentConfig.stream) {
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No response body for streaming');
            
            let buf = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6).trim();
                    if (raw === '[DONE]') break;
                    try {
                        const chunk = JSON.parse(raw);
                        const delta = chunk.choices?.[0]?.delta?.content || '';
                        fullText += delta;
                        updateAssistantMessage(fullText);
                    } catch {}
                }
            }
        } else {
            const data = await res.json();
            fullText = data.choices?.[0]?.message?.content || '';
            updateAssistantMessage(fullText);
        }
    } catch (e: any) {
        setAssistantError(e.message);
    } finally {
        isStreaming.set(false);
    }
};
