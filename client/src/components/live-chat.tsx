import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! How can we help you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { name: string; email: string; message: string; subject?: string }) => {
      const response = await apiRequest('POST', '/api/support/message', {
        ...messageData,
        subject: "Live Chat Support Request"
      });
      return response.json();
    },
    onSuccess: () => {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message: currentMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Add auto-response
      setTimeout(() => {
        const autoResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: '✅ Message sent successfully! We\'ve emailed you a confirmation and our support team will respond within 24 hours. For urgent issues, join our Discord server.',
          sender: 'support',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, autoResponse]);
      }, 1000);
      
      setCurrentMessage('');
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  });

  const handleStartChat = () => {
    if (!customerName || !customerEmail) {
      alert('Please enter your name and email to start the chat.');
      return;
    }
    setHasStartedChat(true);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    sendMessageMutation.mutate({
      name: customerName,
      email: customerEmail,
      message: currentMessage
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasStartedChat) {
        handleSendMessage();
      } else {
        handleStartChat();
      }
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-neon-purple hover:bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover-glow transition-all duration-300 transform hover:scale-110"
        >
          {isOpen ? (
            <i className="fas fa-times text-xl"></i>
          ) : (
            <i className="fas fa-comments text-xl"></i>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-medium-gray border border-gray-600 rounded-lg shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-neon-purple text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-headset"></i>
              <span className="font-bold">Live Support</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Online</span>
            </div>
          </div>

          {!hasStartedChat ? (
            /* Start Chat Form */
            <div className="flex-1 p-4 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Start a conversation</h3>
                <p className="text-gray-300 text-sm">We'll respond to your email as quickly as possible.</p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none"
                  onKeyPress={handleKeyPress}
                />
                
                <input
                  type="email"
                  placeholder="Your email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none"
                  onKeyPress={handleKeyPress}
                />
                
                <button
                  onClick={handleStartChat}
                  disabled={!customerName || !customerEmail}
                  className="w-full bg-neon-purple hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded font-bold transition-colors duration-300"
                >
                  Start Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-neon-purple text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-600">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 bg-black border border-gray-600 rounded text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none"
                    disabled={sendMessageMutation.isPending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                    className="bg-neon-purple hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors duration-300"
                  >
                    {sendMessageMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Messages are sent to support@kernal.wtf
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}