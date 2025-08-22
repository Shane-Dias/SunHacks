import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare, User, Clock, Heart, Send, Bot, Settings } from 'lucide-react';

const AIVirtualCallingSystem = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ended
  const [callType, setCallType] = useState('voice');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPersonality, setSelectedPersonality] = useState('healthcare');
  const [apiKey, setApiKey] = useState('AIzaSyBx5oCo724GNVRC5prKOwgYsb7miLnIjO4');
  const [showSettings, setShowSettings] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);
  
  const callTimer = useRef(null);
  const timeTimer = useRef(null);
  const speechSynthesis = useRef(null);
  const recognition = useRef(null);

  // AI Personality Configurations
  const aiPersonalities = {
    healthcare: {
      name: 'Dr. AI Assistant',
      avatar: '🏥',
      role: 'Healthcare Professional',
      systemPrompt: `You are Dr. AI Assistant, a compassionate and knowledgeable healthcare professional. You provide medical guidance, health advice, and support to patients. Always be empathetic, ask relevant follow-up questions, and provide clear, helpful medical information. If something seems serious, recommend seeking immediate medical attention. Keep responses concise but informative.`,
      greeting: "Hello! I'm Dr. AI Assistant. I'm here to help with your health concerns. How can I assist you today?"
    },
    therapist: {
      name: 'Alex Mindwell',
      avatar: '🧠',
      role: 'Mental Health Therapist',
      systemPrompt: `You are Alex Mindwell, a caring and professional mental health therapist. You provide emotional support, coping strategies, and mental health guidance. Always be empathetic, non-judgmental, and supportive. Ask thoughtful questions to understand the person's feelings and situation. Provide practical advice and coping mechanisms. Keep responses warm and understanding.`,
      greeting: "Hi there! I'm Alex, your mental health support assistant. I'm here to listen and help. What's on your mind today?"
    },
    coach: {
      name: 'Coach Riley',
      avatar: '💪',
      role: 'Life Coach',
      systemPrompt: `You are Coach Riley, an enthusiastic and motivational life coach. You help people achieve their goals, overcome challenges, and improve their lives. Be positive, encouraging, and action-oriented. Ask powerful questions that help people think deeper about their goals and obstacles. Provide practical strategies and motivation. Keep responses energetic and inspiring.`,
      greeting: "Hey there! I'm Coach Riley, your personal life coach. I'm excited to help you achieve your goals! What would you like to work on today?"
    },
    consultant: {
      name: 'Dr. Business',
      avatar: '💼',
      role: 'Business Consultant',
      systemPrompt: `You are Dr. Business, a professional business consultant with expertise in strategy, operations, and growth. You help with business problems, strategic planning, and professional development. Be analytical, practical, and results-focused. Ask clarifying questions about business goals and challenges. Provide actionable business advice. Keep responses professional and strategic.`,
      greeting: "Good day! I'm Dr. Business, your AI business consultant. I'm here to help with your business challenges and growth strategies. What can we discuss today?"
    },
    teacher: {
      name: 'Professor Sage',
      avatar: '📚',
      role: 'Educational Tutor',
      systemPrompt: `You are Professor Sage, a knowledgeable and patient educational tutor. You help explain complex topics, answer questions, and guide learning. Be clear, patient, and encouraging. Break down complex concepts into understandable parts. Ask questions to gauge understanding and provide examples. Keep responses educational and supportive.`,
      greeting: "Hello! I'm Professor Sage, your AI tutor. I'm here to help you learn and understand any topic you're curious about. What would you like to explore today?"
    }
  };

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };
      
      recognition.current.onerror = () => {
        setIsListening(false);
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    // Time timer
    timeTimer.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timeTimer.current) clearInterval(timeTimer.current);
      if (callTimer.current) clearInterval(callTimer.current);
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    }
  }, [callStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Backend API Integration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const callBackendAPI = async (message, context = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          personality: selectedPersonality,
          conversationHistory: context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.response) {
        return data.response;
      } else {
        throw new Error(data.message || 'No response generated');
      }
    } catch (error) {
      console.error('Backend API Error:', error);
      
      // Return fallback responses based on personality
      const fallbackResponses = {
        healthcare: "I apologize, but I'm having trouble connecting to my medical knowledge base right now. For any urgent medical concerns, please consult with a healthcare professional directly.",
        therapist: "I'm sorry, I'm experiencing some technical difficulties right now. Remember that you're not alone, and if you're in crisis, please reach out to a mental health professional.",
        coach: "I'm having some connectivity issues at the moment, but I believe in you! Keep pushing forward!",
        consultant: "I'm experiencing some system issues right now. Please try documenting your business questions.",
        teacher: "I'm having trouble accessing my knowledge systems right now. Don't let this stop your learning journey!"
      };
      
      return fallbackResponses[selectedPersonality] || "I apologize, but I'm experiencing technical difficulties. Please try again in a few moments.";
    }
  };

  const speakText = (text) => {
    if (speechSynthesis.current && !isMuted) {
      speechSynthesis.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => setIsAISpeaking(false);
      utterance.onerror = () => setIsAISpeaking(false);
      
      speechSynthesis.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const initiateCall = (type = 'voice') => {
    setCallType(type);
    setIsCallActive(true);
    setCallStatus('connecting');
    setCallDuration(0);
    setMessages([]);
    setConversationContext([]);
    
    setTimeout(() => {
      setCallStatus('connected');
      
      // AI greeting
      setTimeout(() => {
        const personality = aiPersonalities[selectedPersonality];
        const greeting = {
          id: Date.now(),
          text: personality.greeting,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages([greeting]);
        setConversationContext([greeting]);
        
        if (type === 'voice') {
          speakText(personality.greeting);
        }
      }, 1000);
    }, 2000);
  };

  const endCall = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
    }
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
    
    setIsCallActive(false);
    setCallStatus('ended');
    setIsMuted(false);
    setIsVideoOn(false);
    setIsAISpeaking(false);
    setIsListening(false);
    
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  };

  const sendMessage = async () => {
    if (newMessage.trim() && callStatus === 'connected') {
      const userMessage = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      
      const updatedMessages = [...messages, userMessage];
      const updatedContext = [...conversationContext, userMessage];
      
      setMessages(updatedMessages);
      setConversationContext(updatedContext);
      
      const messageText = newMessage;
      setNewMessage('');
      setIsAISpeaking(true);
      
      try {
        const aiResponse = await callBackendAPI(messageText, conversationContext);
        
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        const finalContext = [...updatedContext, aiMessage];
        
        setMessages(finalMessages);
        setConversationContext(finalContext);
        setIsAISpeaking(false);
        
        if (callType === 'voice' && !isMuted) {
          speakText(aiResponse);
        }
        
      } catch (error) {
        console.error('AI API Error:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: "I apologize, but I'm experiencing some technical difficulties. Please try again.",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages([...updatedMessages, errorMessage]);
        setIsAISpeaking(false);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsAISpeaking(false);
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const CallInterface = () => {
    const personality = aiPersonalities[selectedPersonality];
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col text-white z-50">
        {/* AI Avatar and Info */}
        <div className="p-6 text-center">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/30">
            <span className="text-6xl">{personality.avatar}</span>
          </div>
          <h2 className="text-2xl font-semibold mb-1">
            {callStatus === 'connecting' ? 'Connecting to AI...' : 
             callStatus === 'connected' ? personality.name : 'Call Ended'}
          </h2>
          <p className="text-white/80 mb-2">
            {callStatus === 'connecting' ? 'Initializing AI systems...' :
             callStatus === 'connected' ? `${personality.role} • ${formatTime(callDuration)}` :
             'Thank you for using AI Virtual Assistant'}
          </p>
          
          {isAISpeaking && (
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">AI is speaking...</span>
            </div>
          )}
          
          {isListening && (
            <div className="flex items-center justify-center space-x-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Listening...</span>
            </div>
          )}
        </div>

        {callStatus === 'connecting' && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {callStatus === 'connected' && (
          <div className="flex-1 px-4 pb-4">
            <div className="bg-black/20 rounded-xl h-80 overflow-y-auto p-4 mb-4 backdrop-blur-sm border border-white/20">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs opacity-75 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
              
              {isAISpeaking && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message or use voice..."
                className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-4 py-3 rounded-xl border border-white/30 transition-colors ${
                  isListening ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                } backdrop-blur-sm`}
              >
                <Mic size={16} />
              </button>
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="p-6">
          {callStatus === 'connected' && (
            <div className="flex space-x-4 justify-center mb-6">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                } backdrop-blur-sm border border-white/30`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    !isVideoOn ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                  } backdrop-blur-sm border border-white/30`}
                >
                  {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors mx-auto"
            >
              <PhoneOff size={28} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isCallActive) {
    return <CallInterface />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="text-blue-500 mr-3" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">AI Virtual Assistant</h1>
          </div>
          <p className="text-gray-600 mb-2">Powered by Google Gemini AI • Natural conversations with intelligent responses</p>
          <div className="flex items-center justify-center text-green-600 font-semibold">
            <Clock size={16} className="mr-1" />
            <span>Available 24/7 • {currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Personalities */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your AI Assistant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aiPersonalities).map(([key, personality]) => (
              <div
                key={key}
                onClick={() => setSelectedPersonality(key)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedPersonality === key
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800 shadow-md'
                }`}
              >
                <div className="text-3xl mb-2 text-center">{personality.avatar}</div>
                <h3 className="font-semibold text-center mb-1">{personality.name}</h3>
                <p className="text-sm text-center opacity-80">{personality.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Start Your AI Conversation</h2>
          
          {selectedPersonality && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{aiPersonalities[selectedPersonality].avatar}</span>
                <div>
                  <h3 className="font-semibold text-blue-800">{aiPersonalities[selectedPersonality].name}</h3>
                  <p className="text-blue-700 text-sm">{aiPersonalities[selectedPersonality].role}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => initiateCall('voice')}
              className="flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
            >
              <Phone className="mr-2" size={20} />
              Voice Call with AI
            </button>
            
            <button
              onClick={() => initiateCall('chat')}
              className="flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
            >
              <MessageSquare className="mr-2" size={20} />
              Chat with AI
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
            >
              <Settings className="mr-2" size={20} />
              Settings
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🎤 Voice Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Speech-to-text input</li>
              <li>• Natural AI voice responses</li>
              <li>• Real-time conversation</li>
              <li>• Mute/unmute controls</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🧠 AI Capabilities</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Contextual conversations</li>
              <li>• Multiple AI personalities</li>
              <li>• Intelligent responses</li>
              <li>• Professional expertise</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">🔒 Powered by Google Gemini AI • Secure conversations</p>
          <p className="text-sm">Advanced AI technology • Natural language processing • Real-time responses</p>
        </div>
      </div>
    </div>
  );
};

export default AIVirtualCallingSystem;