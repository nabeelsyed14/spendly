import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useTransactions } from '../../hooks/useData';
import { chatWithAI, getRequestsRemaining } from '../../lib/ai';

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];

  const processInline = (str) => {
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:var(--input-bg);padding:1px 4px;border-radius:4px;font-size:0.75rem">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) inTable = true;
      const cells = trimmed.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) continue;
      tableRows.push(cells);
      continue;
    }

    if (inTable && tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1);
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-2">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {header.map((cell, ci) => (
                  <th key={ci} className="text-left px-2 py-1.5 font-semibold border-b" style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1.5 border-b" style={{ borderColor: 'var(--border)' }} dangerouslySetInnerHTML={{ __html: processInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }

    if (trimmed === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      elements.push(
        <div key={`ol-${i}`} className="flex gap-2 py-0.5">
          <span className="font-semibold text-primary-500 tabular-nums">{olMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: processInline(olMatch[2]) }} />
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={`ul-${i}`} className="flex gap-2 py-0.5">
          <span className="text-primary-500">&#x2022;</span>
          <span dangerouslySetInnerHTML={{ __html: processInline(trimmed.slice(2)) }} />
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('#')) {
      elements.push(
        <p key={`h-${i}`} className="font-bold text-sm mt-2" dangerouslySetInnerHTML={{ __html: processInline(trimmed.replace(/^#+\s*/, '')) }} />
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="py-0.5" dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
    );
  }

  if (inTable && tableRows.length > 0) {
    const header = tableRows[0];
    const body = tableRows.slice(1);
    elements.push(
      <div key="table-last" className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {header.map((cell, ci) => (
                <th key={ci} className="text-left px-2 py-1.5 font-semibold border-b" style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 border-b" style={{ borderColor: 'var(--border)' }} dangerouslySetInnerHTML={{ __html: processInline(cell) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
}

export default function ChatDrawer({ isOpen, onClose, onOpen }) {
  const transactions = useTransactions();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendMessage = async (customInput) => {
    const text = customInput || input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await chatWithAI([...messages, userMsg], transactions);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How much did I spend this month?',
    'Where can I cut costs?',
    'Analyze my top category',
  ];

  const remaining = getRequestsRemaining();

  return (
    <>
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 animate-scale-in"
          style={{ boxShadow: '0 4px 20px rgba(13,148,136,0.35)' }}
        >
          <Sparkles size={20} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          <div
            className="relative w-full max-w-md h-full flex flex-col animate-slide-left"
            style={{
              background: 'var(--surface-solid)',
              borderLeft: '1px solid var(--border-solid)',
              borderRadius: 0,
              animation: 'slide-left 0.3s ease-out',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-solid)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Spendly AI</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{remaining} requests left today</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all duration-200 hover:bg-primary-500/10 active:scale-90"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold mb-1">Ask me anything about your finances</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    I have access to your spending data
                  </p>
                  <p className="text-[10px] mb-4 px-4" style={{ color: 'var(--text-muted)' }}>
                    AI sends spending summaries to Groq for analysis. No raw transactions are shared.
                  </p>

                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 hover:bg-primary-500/5 hover:border-primary-500/30 active:scale-[0.98] animate-slide-up stagger-${i + 1}`}
                        style={{ borderColor: 'var(--border-solid)', color: 'var(--text)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'rounded-bl-md'
                    }`}
                    style={msg.role !== 'user' ? { background: 'var(--input-bg)', color: 'var(--text)' } : {}}
                  >
                    {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'var(--input-bg)' }}>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t" style={{ borderColor: 'var(--border-solid)' }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about your spending..."
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
