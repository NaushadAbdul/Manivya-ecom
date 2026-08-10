import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, ShoppingBag, ArrowRight, RefreshCw, ThumbsUp } from 'lucide-react';
import { apiService } from '../../services/api';
import { Product, Category } from '../../types';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'categories' | 'products';
  data?: any;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Time-aware greeting helper
  const getTimeGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Good Morning ☀️';
    if (hours >= 12 && hours < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  useEffect(() => {
    const greeting = getTimeGreeting();
    setMessages([
      {
        id: 'init-1',
        sender: 'bot',
        text: `${greeting}! Welcome to MANIVYA Enterprises 😊🙏🏻 How can I assist your shopping today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Pre-fetch categories & recommended products for instant bot responses
    apiService.getCategories().then((res) => {
      if (res.data && res.data.success) setCategories(res.data.data);
    }).catch(() => {});

    apiService.getProducts({ limit: 4, sort: 'rating' }).then((res) => {
      if (res.data && res.data.success) setFeaturedProducts(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputMsg).trim();
    if (!query) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');

    // Generate Bot Response after short typing delay
    setTimeout(() => {
      processBotResponse(query);
    }, 400);
  };

  const processBotResponse = (query: string) => {
    const lower = query.toLowerCase();
    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const greeting = getTimeGreeting();

    let botResponseText = '';
    let type: 'text' | 'categories' | 'products' = 'text';
    let responseData: any = null;

    if (
      lower.includes('hey') ||
      lower.includes('hi') ||
      lower.includes('hello') ||
      lower.includes('namaste') ||
      lower.includes('hlo')
    ) {
      botResponseText = `hello 😊🙏🏻 welcome to our store! ${greeting}. I am your MANIVYA AI concierge. You can ask me to show categories, recommend trending items, or check special promo discount codes!`;
    } else if (
      lower.includes('good morning') ||
      lower.includes('good afternoon') ||
      lower.includes('good evening')
    ) {
      botResponseText = `${greeting}! Wishing you a wonderful shopping experience at MANIVYA Enterprises. What product category would you like to explore today?`;
    } else if (
      lower.includes('category') ||
      lower.includes('categories') ||
      lower.includes('show categories') ||
      lower.includes('department')
    ) {
      botResponseText = `Here are our premium product categories available for instant delivery:`;
      type = 'categories';
      responseData = categories;
    } else if (
      lower.includes('recommend') ||
      lower.includes('best') ||
      lower.includes('top') ||
      lower.includes('trending') ||
      lower.includes('what should i buy') ||
      lower.includes('suggestion')
    ) {
      botResponseText = `Here are our top-rated customer bestsellers that I highly recommend you check out:`;
      type = 'products';
      responseData = featuredProducts;
    } else if (
      lower.includes('bottle') ||
      lower.includes('bottel') ||
      lower.includes('water')
    ) {
      botResponseText = `💧 Check out our new **Water Bottels & Hydration** collection! Featuring smart LED temperature bottles and stainless steel vacuum flasks.`;
      type = 'categories';
      responseData = categories.filter(c => c.name.toLowerCase().includes('bottle'));
    } else if (
      lower.includes('offer') ||
      lower.includes('coupon') ||
      lower.includes('code') ||
      lower.includes('discount')
    ) {
      botResponseText = `🎉 Special Perks Activated! Use code **MANIVYA10** at checkout to get an **Instant 10% Discount** on your order! Plus enjoy FREE Express Shipping over ₹499.`;
    } else if (
      lower.includes('payment') ||
      lower.includes('pay') ||
      lower.includes('upi') ||
      lower.includes('cod')
    ) {
      botResponseText = `💳 We accept **Cash on Delivery (COD)** upon parcel arrival, as well as **Instant UPI / Bank QR Code Scan & Pay** (Google Pay, PhonePe, Paytm, BHIM) with 10-minute payment protection!`;
    } else if (
      lower.includes('delivery') ||
      lower.includes('ship') ||
      lower.includes('time') ||
      lower.includes('track')
    ) {
      botResponseText = `🚚 We dispatch orders within 24 hours via MANIVYA Express Logistics. Real-time GPS order tracking is available under your Account Orders tab!`;
    } else {
      botResponseText = `Thank you for reaching out! You can explore our catalog, filter products by price and rating, or use coupon code **MANIVYA10** for 10% OFF at checkout! Let me know if you would like me to show categories or recommend items.`;
    }

    const botMessage: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: botResponseText,
      timestamp: botTime,
      type,
      data: responseData,
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <>
      {/* Floating Spherical Bot Button at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xl animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask MANIVYA AI ✨</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Shopping Assistant"
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all group flex items-center justify-center"
        >
          {/* Animated Spherical Outer Glow Pulse */}
          <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20 pointer-events-none" />

          <div className="w-full h-full rounded-full bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white">
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative">
                <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Floating Interactive Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-96 max-h-[80vh] h-[500px] bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Chat Window Header */}
          <div className="bg-gradient-to-r from-indigo-900/80 via-slate-900 to-purple-900/80 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  MANIVYA AI Assistant <Sparkles className="w-3 h-3 text-indigo-400" />
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Shopping Concierge
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-slate-900/60 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSend('Show categories')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 border border-slate-700/60 rounded-full shrink-0 transition-all"
            >
              🏷️ Show Categories
            </button>
            <button
              onClick={() => handleSend('Recommend top products')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 border border-slate-700/60 rounded-full shrink-0 transition-all"
            >
              ⭐ Recommend Products
            </button>
            <button
              onClick={() => handleSend('Show discount codes')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 border border-slate-700/60 rounded-full shrink-0 transition-all"
            >
              🎉 Offers & Code
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Render Categories List if requested */}
                  {msg.type === 'categories' && Array.isArray(msg.data) && (
                    <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800/80">
                      {msg.data.map((cat: Category) => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex justify-between items-center p-2 bg-slate-950 hover:bg-slate-800 rounded-xl text-[11px] text-indigo-300 hover:text-white border border-slate-800 transition-colors"
                        >
                          <span className="font-semibold">{cat.name}</span>
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Render Products Recommendations if requested */}
                  {msg.type === 'products' && Array.isArray(msg.data) && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80">
                      {msg.data.map((prod: Product) => (
                        <Link
                          key={prod._id}
                          to={`/product/${prod.slug || prod._id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2.5 p-2 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors text-left"
                        >
                          <img
                            src={prod.images?.[0] || ''}
                            alt=""
                            className="w-9 h-9 object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-1 truncate">
                            <h5 className="font-bold text-white text-[11px] truncate">{prod.name}</h5>
                            <p className="text-[10px] text-emerald-400 font-extrabold">₹{prod.sellingPrice?.toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask bot e.g. 'hey', 'show categories'..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
