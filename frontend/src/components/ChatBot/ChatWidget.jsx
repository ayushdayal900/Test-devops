import React, { useState, useRef, useEffect, useContext } from 'react';
import api from '../../services/api';
import { MessageCircle, X, Send, ShoppingBag, MapPin, User, LayoutDashboard, Database, UserPlus, LogIn, Phone, Globe } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Namaste! How can I help you today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const [suggestedActions, setSuggestedActions] = useState(null);

    // Contexts
    const { user, token } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (text = inputValue) => {
        if (!text.trim()) return;

        // Add User Message
        const newMessages = [...messages, { type: 'user', text }];
        setMessages(newMessages);
        setInputValue('');
        setSuggestedActions(null); // Clear previous suggestions

        // Intercept Local Commands
        if (text.startsWith('navigate:')) {
            const path = text.split(':')[1];
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setMessages(prev => [...prev, { type: 'bot', text: `Navigating to ${path.replace('/', '')}...` }]);
                navigate(path);
            }, 800);
            return;
        }

        if (text === 'action:toggleLanguage') {
            const newLang = i18n.language === 'en' ? 'mr' : 'en';
            i18n.changeLanguage(newLang);
            setMessages(prev => [...prev, { type: 'bot', text: `Language changed to ${newLang === 'en' ? 'English' : 'Marathi'}` }]);
            return;
        }

        setLoading(true);

        try {
            if (!token) {
                setMessages([...newMessages, { type: 'bot', text: "Please login to use the full chatbot features." }]);
                setLoading(false);
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await api.post('/chatbot/message', { message: text }, config);

            // Add Bot Response
            const botMsg = { type: 'bot', text: res.data.text };
            setMessages(prev => [...prev, botMsg]);

            // Set Suggestions if provided
            if (res.data.suggestions) {
                setSuggestedActions(res.data.suggestions);
            }

            // Execute Action
            if (res.data.action) {
                executeAction(res.data.action);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const executeAction = (action) => {
        console.log("Executing Action:", action);
        switch (action.type) {
            case 'NAVIGATE':
                // Small delay to allow user to read message before jump
                setTimeout(() => navigate(action.payload), 1000);
                break;
            case 'ADD_TO_CART':
                const { product, quantity } = action.payload;
                for (let i = 0; i < quantity; i++) {
                    addToCart(product);
                }
                setTimeout(() => {
                    setMessages(prev => [...prev, { type: 'bot', text: `✅ Added ${quantity} ${product.name}(s) to cart.` }]);
                    // Use optional chaining for suggestions as they might depend on role
                    setSuggestedActions([
                        { label: 'View Cart', icon: <ShoppingBag size={14} />, cmd: 'Go to cart' },
                        { label: 'Checkout', icon: <Send size={14} />, cmd: 'Proceed to checkout' }
                    ]);
                }, 500);
                break;
            default:
                break;
        }
    };

    const getActions = () => {
        if (!user) {
            return [
                { label: 'Signup', icon: <UserPlus size={14} />, cmd: 'navigate:/register' },
                { label: 'Login', icon: <LogIn size={14} />, cmd: 'navigate:/login' },
                { label: 'Explore Designs', icon: <ShoppingBag size={14} />, cmd: 'navigate:/designs' },
                { label: 'Contact', icon: <Phone size={14} />, cmd: 'navigate:/contact' },
                { label: 'Change Language', icon: <Globe size={14} />, cmd: 'action:toggleLanguage' },
            ];
        }

        if (user.role === 'admin') {
            return [
                { label: 'Total Sales', icon: <Database size={14} />, cmd: 'Show total sales' },
                { label: 'Pending Orders', icon: <ShoppingBag size={14} />, cmd: 'Show pending orders' },
                { label: 'CMS', icon: <LayoutDashboard size={14} />, cmd: 'Open CMS' },
            ];
        }

        return [
            { label: 'Track Order', icon: <MapPin size={14} />, cmd: 'Track my order' },
            { label: 'Shop Sarees', icon: <ShoppingBag size={14} />, cmd: 'Show me designs' },
            { label: 'Contact Us', icon: <User size={14} />, cmd: 'Contact store' },
        ];
    };

    const currentActions = suggestedActions || getActions();

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-maroon text-white p-4 rounded-full shadow-lg hover:scale-110 transition duration-300 animate-bounce"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[80vh] flex flex-col border border-gray-200 overflow-hidden transform transition-all duration-300 origin-bottom-right">
                    {/* Header */}
                    <div className="bg-brand-maroon p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-bold">Mahalaxmi Assistant</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 font-bold text-xl" title="Minimize">
                                −
                            </button>
                            {/* Uncomment if a distinct close is needed, otherwise Minimize acts as toggle */}
                            {/* <button onClick={() => setIsOpen(false)} className="hover:text-gray-200"><X size={20} /></button> */}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth chat-scrollbar relative">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`mb-3 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.type === 'user'
                                    ? 'bg-brand-gold text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start mb-3">
                                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-gray-100">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="p-2 bg-gray-50 flex gap-2 overflow-x-auto border-t border-gray-100 custom-scrollbar snap-x">
                        {currentActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(action.cmd)}
                                className="flex-shrink-0 snap-center flex items-center gap-1 bg-white border border-brand-gold/30 text-brand-maroon text-xs px-3 py-1.5 rounded-full hover:bg-brand-gold hover:text-white transition whitespace-nowrap shadow-sm"
                            >
                                {action.icon} {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                                placeholder="Type a command..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim()}
                                className="bg-brand-maroon text-white p-2 rounded-full disabled:opacity-50 hover:bg-red-900 transition"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
