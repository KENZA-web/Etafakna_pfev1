import React, { useState } from 'react';
import { sendMessageToAssistant, ChatMessage } from '../../services/assistantIA';
import { X, Send, Sparkles } from 'lucide-react';

interface ChatbotProps {
  documentContext: any;
  onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ documentContext, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Bonjour ! Je suis votre assistant IA. Je peux vous aider à comprendre ce document (${documentContext.id}). Posez-moi une question.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendMessageToAssistant([...messages, userMsg], documentContext);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[550px]">
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-accent to-blue-700 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-white" />
          <span className="font-bold text-white">Assistant IA</span>
        </div>
        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px] max-h-[400px]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-400 text-sm animate-pulse">L'assistant réfléchit...</div>}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Posez une question..."
          className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button onClick={handleSend} className="p-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};