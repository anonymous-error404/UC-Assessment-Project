import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import './AIChatbot.css';

export default function AIChatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I\'m your AI assistant. Ask me anything about your issues or projects.' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || loading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: msg }]);
        setLoading(true);

        try {
            const res = await aiAPI.chat(msg);
            setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                className="chatbot-fab"
                onClick={() => setOpen(!open)}
                title="AI Assistant"
            >
                {open ? '✕' : '🤖'}
            </button>

            {/* Panel */}
            {open && (
                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <span className="chatbot-header-title">
                            <span className="chatbot-header-dot" />
                            AI Assistant
                        </span>
                        <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-msg ai loading">Thinking...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-row">
                        <input
                            type="text"
                            placeholder="Ask about issues, projects..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button
                            className="chatbot-send"
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
