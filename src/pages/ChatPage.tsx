import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import FeedbackModal from '@/components/FeedbackModal';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSocketContext } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeInput } from '@/utils/privacy';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE_URL = 'https://ventoutserver.onrender.com';

const ChatPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        isConnected,
        currentRoom,
        partner,
        partnerTyping,
        sendTextMessage,
        sendVoiceMessage,
        leaveChat,
        currentConvoId,
        setChatSession,
        clearChatSession,
        onTextMessage,
        onVoiceMessage,
        onPartnerDisconnected,
    } = useSocketContext();

    const [message, setMessage] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isWaitingForMatch, setIsWaitingForMatch] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [messages, setMessages] = useState<any[]>([]);

    const { topic, feeling } = location.state || {};
    const userRole = user?.role || 'talker';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch chat history when conversation ID is available
    useEffect(() => {
        if (currentConvoId && currentRoom) {
            const fetchChatHistory = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/conversations/${currentConvoId}/messages`);

                    if (response.ok) {
                        const history = await response.json();
                        
                        // Normalize the message format from the database
                        const normalizedHistory = history.map(msg => ({
                            id: msg._id,
                            roomId: msg.conversationId,
                            senderId: msg.sender,
                            sender: msg.sender,
                            content: msg.content,
                            text: msg.content,
                            timestamp: new Date(msg.createdAt),
                            createdAt: new Date(msg.createdAt),
                            type: msg.type || (msg.audioData ? 'voice' : 'text'),
                            audioData: msg.audioData,
                            duration: msg.duration,
                        }));

                        setMessages(normalizedHistory);
                    } else {
                        throw new Error('Failed to fetch chat history');
                    }
                } catch (error) {
                    console.error("Error fetching chat history:", error);
                    toast({
                        title: "Error",
                        description: "Could not load chat history. Please try again.",
                        variant: "destructive"
                    });
                }
            };
            fetchChatHistory();
        } else {
            setMessages([]);
        }
    }, [currentConvoId, currentRoom, toast]);

    // Listen for new incoming messages from the socket (text and voice)
    useEffect(() => {
        const removeTextListener = onTextMessage((newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        });

        const removeVoiceListener = onVoiceMessage((voiceMsg) => {
            const normalized = {
                id: voiceMsg.id,
                roomId: voiceMsg.roomId,
                senderId: voiceMsg.senderId,
                sender: voiceMsg.senderId,
                content: '',
                text: '',
                timestamp: voiceMsg.createdAt ? new Date(voiceMsg.createdAt) : new Date(),
                createdAt: voiceMsg.createdAt ? new Date(voiceMsg.createdAt) : new Date(),
                type: 'voice' as const,
                audioData: voiceMsg.audioData,
                duration: voiceMsg.duration,
            };
            setMessages(prev => [...prev, normalized]);
        });
        
        const removePartnerListener = onPartnerDisconnected(() => {
            toast({
                title: "Chat Ended",
                description: "Your partner has disconnected. Please submit feedback to start a new chat."
            });
            clearChatSession();
            setShowFeedback(true);
        });

        return () => {
            removeTextListener();
            removeVoiceListener();
            removePartnerListener();
        };
    }, [onTextMessage, onVoiceMessage, onPartnerDisconnected, clearChatSession, toast]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update connection status based on socket state
    useEffect(() => {
        if (isConnected && currentRoom) {
            setConnectionStatus('connected');
            setIsWaitingForMatch(false);
        } else if (isConnected) {
            setConnectionStatus('connected');
            setIsWaitingForMatch(true);
        } else {
            setConnectionStatus('connecting');
            setIsWaitingForMatch(true);
        }
    }, [isConnected, currentRoom]);

    // Show match found notification
    useEffect(() => {
        if (currentRoom && partner && isWaitingForMatch) {
            setIsWaitingForMatch(false);
            toast({
                title: "Match Found!",
                description: `Connected with a ${partner.role}. Your conversation is anonymous.`,
            });
        }
    }, [currentRoom, partner, isWaitingForMatch, toast]);

    const handleCancelWaiting = () => {
        navigate('/');
    };

    const handleSendMessage = () => {
        if (message.trim() && connectionStatus === 'connected' && currentRoom && user) {
            const sanitizedMessage = sanitizeInput(message);
            sendTextMessage(sanitizedMessage);
            setMessage('');
        }
    };

    const handleSendVoiceMessage = (audioData: string, duration: number) => {
        if (connectionStatus === 'connected' && currentRoom && user) {
            // Add voice message to local state immediately (optimistic update)
            const voiceMessage = {
                id: `voice-${Date.now()}`,
                roomId: currentRoom,
                senderId: user.id,
                sender: user.id,
                content: '',
                text: '',
                timestamp: new Date(),
                createdAt: new Date(),
                type: 'voice' as const,
                audioData,
                duration,
            };
            
            setMessages(prev => [...prev, voiceMessage]);
            
            // Send to server
            sendVoiceMessage(audioData, duration);
        }
    };

    const handleEndChat = () => {
        if (currentRoom) {
            leaveChat();
        }
        setShowFeedback(true);
    };

    const handleFeedbackSubmit = (rating: number, feedbackText: string) => {
        console.log('Feedback submitted:', {
            rating,
            feedbackText,
            sessionDetails: {
                roomId: currentRoom,
                userRole,
                topic,
                feeling,
                messageCount: messages.length
            }
        });
        toast({
            title: "Chat Ended",
            description: "Thank you for using Plaro and for your feedback. Take care of yourself.",
        });
        navigate('/');
    };

    const handleFeedbackClose = () => {
        setShowFeedback(false);
        toast({
            title: "Chat Ended",
            description: "Thank you for using Plaro. Take care of yourself.",
        });
        navigate('/');
    };

    const handleReport = () => {
        toast({
            title: "Report Submitted",
            description: "Thank you for your feedback. We take all reports seriously.",
        });
    };

    // Show waiting screen for talkers while looking for a match
    if (userRole === 'talker' && isWaitingForMatch) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                    <Card className="p-8 max-w-md w-full text-center space-y-6">
                        <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                        <h2 className="text-2xl font-semibold">Looking for a listener...</h2>
                        <p className="text-muted-foreground">
                            We're connecting you with someone who wants to listen.
                        </p>
                        <Button onClick={handleCancelWaiting} variant="outline">
                            Cancel
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
                <ChatHeader
                    userRole={userRole}
                    connectionStatus={connectionStatus}
                    sessionId={currentRoom || 'connecting'}
                />

                <MessageList
                    messages={messages}
                    userRole={userRole}
                    partnerTyping={partnerTyping}
                    messagesEndRef={messagesEndRef}
                    user={user}
                />

                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    onSendMessage={handleSendMessage}
                    onSendVoiceMessage={handleSendVoiceMessage}
                    onEndChat={handleEndChat}
                    onReport={handleReport}
                    connectionStatus={connectionStatus}
                />
            </div>

            <FeedbackModal
                isOpen={showFeedback}
                onClose={handleFeedbackClose}
                onSubmit={handleFeedbackSubmit}
            />
        </Layout>
    );
};

export default ChatPage;
