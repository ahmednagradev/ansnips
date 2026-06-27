import { Readable } from 'stream';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { messages, newMessage } = request.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return response.status(500).json({ error: 'Missing API Key on server.' });
        }

        // 1. SAFELY Parse History from your exact React state schema
        const historyPayload = [];
        
        if (Array.isArray(messages)) {
            messages.forEach((msg) => {
                // Ignore empty messages or the one that's currently being generated
                if (!msg.text || !msg.text.trim()) return;
                
                // Map your frontend types ('sent' / 'received') to standard OpenAI roles
                const role = msg.type === 'sent' ? 'user' : 'assistant';
                historyPayload.push({
                    role: role,
                    content: msg.text.trim()
                });
            });
        }

        // 2. Build the structural messages payload for Groq
        const messagesPayload = [
            {
                role: 'system',
                content: `You are the official built-in AI Assistant for Ansnips, a modern, next-generation social media platform. Ansnips is a dynamic digital space where users connect, share authentic content, communicate in real-time, and express themselves through a clean, premium, and responsive user experience.\n\nYour core traits:\n1. Brand Voice: Speak with a friendly, engaging, modern, and tech-savvy persona. Be warm, supportive, and social-never sound robotic, clinical, or overly corporate.\n2. Platform Awareness: You know you live directly inside the Ansnips ecosystem. If users ask about social media trends, creating content, or engaging with people, frame your answers through the lens of digital creativity, connection, and real-time interaction.\n3. Content & Formatting: Break up walls of text. Keep paragraphs short and use clean Markdown structure to deliver insightful, clear, and punchy responses.\n\nStrict Guardrails:\n- Never break character or refer to yourself as a standalone LLM or an API endpoint. You are the Ansnips Assistant.\n- Respond directly to what the user asks without generic introductory sentences or onboarding speeches.`
            },
            ...historyPayload,
            {
                role: 'user',
                content: newMessage.trim()
            }
        ];

        // 3. Post to Groq
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messagesPayload,
                stream: true,
                temperature: 0.7,
                max_tokens: 2048,
            }),
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error("Groq Upstream Error:", errorText);
            return response.status(groqResponse.status).json({ error: 'Groq API failure' });
        }

        // 4. Setup clean event stream pipeline
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');

        const nodeStream = Readable.fromWeb(groqResponse.body);
        nodeStream.pipe(response);

    } catch (error) {
        console.error('Server execution error:', error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}