import React, { useState, useRef, useEffect } from 'react';
import { useDrive } from '../../context/DriveContext';
import { AIChatEngine, ChatTurn } from '../../services/aiChatEngine';
import { SpeechService } from '../../services/speechService';
import { 
  Bot, Send, User, Sparkles, CloudRain, MapPin, Coffee, Siren, 
  CornerDownRight, ShieldAlert, RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isModerated?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ChatbotWidget: React.FC = () => {
  const { 
    currentRoute, 
    weather, 
    activeScenario, 
    driveDurationHours, 
    simulatedSpeedKmH,
    recommendations,
    applyRecommendation,
    triggerSOS,
    changeScenario
  } = useDrive();

  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hey there! I'm your DriveMind companion. I'm right here with you to help with navigation, weather, nearby rest stops, or just to keep you company on your drive. How are you doing today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processQuery = (userQuery: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update conversation history
    const updatedHistory: ChatTurn[] = [...history, { role: 'user', content: userQuery }];

    // Generate AI response using AIChatEngine
    const response = AIChatEngine.generateResponse(userQuery, {
      currentRoute,
      weather,
      activeScenario,
      driveDurationHours,
      simulatedSpeedKmH,
      userName,
      history: updatedHistory
    });

    // Save extracted name if user introduced themselves
    if (response.extractedName) {
      setUserName(response.extractedName);
    }

    // Save assistant reply to history
    setHistory([...updatedHistory, { role: 'assistant', content: response.text }]);

    let actionCallback: (() => void) | undefined = undefined;

    if (response.action) {
      const type = response.action.actionType;
      if (type === 'REROUTE') {
        const rec = recommendations.find(r => r.category === 'REROUTE');
        actionCallback = () => {
          if (rec) applyRecommendation(rec.id);
        };
      } else if (type === 'SOS') {
        actionCallback = () => triggerSOS();
      } else if (type === 'WEATHER_RAIN') {
        actionCallback = () => changeScenario('heavy_rain');
      } else if (type === 'TRAFFIC_SCENARIO') {
        actionCallback = () => changeScenario('heavy_traffic');
      } else if (type === 'REST_STOPS') {
        actionCallback = () => alert("Nearest Rest Stop: Highway Nest Plaza (12 km ahead, 24x7 Dhaba & Fuel)");
      }
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: response.text,
          timestamp: timeStr,
          isModerated: response.isModerated,
          action: response.action && actionCallback ? {
            label: response.action.label,
            onClick: actionCallback
          } : undefined
        }
      ]);
      setIsTyping(false);

      // Clean speech text for voice playback
      if (!response.isModerated) {
        const cleanVoiceText = response.text.replace(/[*•📌⚠️⚡🟢🚨]/g, '');
        SpeechService.speak(cleanVoiceText);
      } else {
        SpeechService.speak("I cannot fulfill requests containing unfriendly or abusive content.");
      }
    }, 400);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: userText,
        timestamp: timeStr
      }
    ]);
    setInputText('');
    setIsTyping(true);

    processQuery(userText);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: promptText,
        timestamp: timeStr
      }
    ]);
    setIsTyping(true);
    processQuery(promptText);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: `Conversation cleared. ${userName ? `Hi ${userName}! ` : ''}How can I help you next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setHistory([]);
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl bg-[#080C16]/95">
      {/* Header */}
      <div className="p-3.5 border-b border-cyan-500/20 bg-slate-950/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Bot className="w-4 h-4 text-black font-bold" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-cyan-200 uppercase tracking-wider flex items-center gap-1.5">
              DriveMind AI Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {userName ? `User: ${userName} • Conversational` : 'Conversational AI • Memory Active'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Reset Conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scrollable Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 no-scrollbar text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl shadow-lg leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none border border-cyan-300/30'
                  : msg.isModerated
                  ? 'bg-red-950/40 border border-red-500/40 text-red-200 rounded-bl-none shadow-[0_0_15px_rgba(255,42,109,0.2)]'
                  : 'bg-slate-900/95 border border-cyan-500/25 text-slate-200 rounded-bl-none shadow-[0_0_12px_rgba(0,0,0,0.4)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/10 pb-1 text-[10px] opacity-75 font-mono">
                <span className="font-bold flex items-center gap-1">
                  {msg.sender === 'user' ? (
                    <>
                      <User className="w-3 h-3 text-cyan-200" /> {userName || 'Driver'}
                    </>
                  ) : msg.isModerated ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Safety Filter
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 text-cyan-400" /> DriveMind AI
                    </>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap text-[11px] space-y-1">
                {msg.text.split('\n').map((line, idx) => {
                  if (line.startsWith('• ')) {
                    return (
                      <div key={idx} className="flex items-start gap-1.5 pl-1">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{line.substring(2)}</span>
                      </div>
                    );
                  }
                  return <p key={idx}>{line}</p>;
                })}
              </div>

              {/* Attached Action Button */}
              {msg.action && (
                <button
                  onClick={msg.action.onClick}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  {msg.action.label}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono bg-slate-900/60 p-2.5 rounded-xl border border-cyan-500/20 w-max animate-pulse">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>DriveMind AI is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleQuickPrompt("What is the weather ahead?")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-[10px] text-cyan-300 transition-all shrink-0 flex items-center gap-1"
        >
          <CloudRain className="w-3 h-3 text-cyan-400" /> Weather
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("What is my current route traffic status?")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-[10px] text-cyan-300 transition-all shrink-0 flex items-center gap-1"
        >
          <MapPin className="w-3 h-3 text-cyan-400" /> Traffic
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("Find nearby rest stops & coffee")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-[10px] text-cyan-300 transition-all shrink-0 flex items-center gap-1"
        >
          <Coffee className="w-3 h-3 text-amber-400" /> Rest Stop
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("Show emergency hospitals & SOS options")}
          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-[10px] text-red-300 transition-all shrink-0 flex items-center gap-1"
        >
          <Siren className="w-3 h-3 text-red-400" /> SOS Help
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={userName ? `Ask DriveMind AI, ${userName}...` : "Ask DriveMind AI anything (weather, traffic, general questions)..."}
          className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
        >
          <Send className="w-4 h-4 font-bold" />
        </button>
      </form>
    </div>
  );
};
