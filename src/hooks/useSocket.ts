import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socketService, UserInfo, SocketMessage } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Message } from '@/types/message';
import { sanitizeInput } from '@/utils/privacy';

export const useSocket = () => {
    const { isAuthenticated, user , logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [isConnected, setIsConnected] = useState(false);
    const [availableTalkers, setAvailableTalkers] = useState<UserInfo[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [partnerTyping, setPartnerTyping] = useState(false);

    const hasAttemptedConnection = useRef(false);
    const [currentConvoId, setCurrentConvoId] = useState<string | null>(
        localStorage.getItem('currentConvoId')
    );
    const [currentRoom, setCurrentRoom] = useState<string | null>(
        localStorage.getItem('currentRoomId')
    );

    // Initialize partner from localStorage on mount
    const getStoredPartner = (): UserInfo | null => {
        const stored = localStorage.getItem('currentPartner');
        return stored ? JSON.parse(stored) : null;
    };

    const [partner, setPartnerState] = useState<UserInfo | null>(getStoredPartner());

    // Wrapper to update partner and persist to localStorage
    const setPartner = useCallback((newPartner: UserInfo | null) => {
        setPartnerState(newPartner);
        if (newPartner) {
            localStorage.setItem('currentPartner', JSON.stringify(newPartner));
        } else {
            localStorage.removeItem('currentPartner');
        }
    }, []);

    const leaveChat = useCallback(() => {
        if (currentRoom) {
            socketService.leaveRoom(currentRoom);
            setCurrentRoom(null);
            setPartner(null);
            setMessages([]);
            setPartnerTyping(false);
            setCurrentConvoId(null);
            localStorage.removeItem('currentConvoId');
            localStorage.removeItem('currentRoomId');
            localStorage.removeItem('currentPartner');
        }
    }, [currentRoom, setPartner]);

    const onTextMessage = useCallback((callback: (message: SocketMessage) => void) => {
        socketService.onTextMessage(callback);
        return () => socketService.offTextMessage(callback);
    }, []);

    const onVoiceMessage = useCallback((callback: (message: SocketMessage) => void) => {
        socketService.onVoiceMessage(callback);
        return () => socketService.offVoiceMessage(callback);
    }, []);

    const onPartnerDisconnected = useCallback((callback: (data: { roomId: string; reason: string }) => void) => {
        socketService.onPartnerDisconnected(callback);
        return () => socketService.offPartnerDisconnected(callback);
    }, []);

    // Rejoin room on reconnect with existing session
    useEffect(() => {
        if (socketService.connected && currentRoom && currentConvoId && partner) {
            console.log(`Reconnecting to existing session - Room: ${currentRoom}, Partner:`, partner);
            socketService.joinRoom(currentRoom);
            
            // Notify that we're back in the chat
            toast({ 
                title: "Reconnected", 
                description: "You've been reconnected to your chat session.",
                duration: 2000
            });
        }
    }, [socketService.connected]);

    const setupEventListeners = useCallback(() => {
        if (!socketService.connected) return;

        socketService.removeAllListeners();

        socketService.onTalkerListUpdate((talkers) => {
            setAvailableTalkers(talkers);
        });

        socketService.onStartChat(({ roomId, partner: chatPartner, convoId }) => {
            setCurrentRoom(roomId);
            setPartner(chatPartner);
            localStorage.setItem('currentConvoId', convoId);
            localStorage.setItem('currentRoomId', roomId);
            setCurrentConvoId(convoId);
            setMessages([]);
            navigate('/chat');
            toast({ title: "Chat Started", description: `Now chatting with a ${chatPartner.role}` });
        });

        socketService.onPartnerDisconnected(({ roomId }) => {
            if (roomId === currentRoom) {
                leaveChat();
                toast({ title: "Partner Disconnected", description: "The conversation has ended.", variant: "destructive" });
                navigate('/');
            }
        });

        const handleReceivedMessage = (socketMessage: SocketMessage) => {
            let timestamp: Date;
            try {
                timestamp = new Date(socketMessage.createdAt); 
                if (isNaN(timestamp.getTime())) {
                    throw new Error('Invalid date format');
                }
            } catch (e) {
                console.error("Invalid timestamp received from server:", socketMessage.createdAt, e);
                timestamp = new Date();
            }
            
            console.log('Received message:', socketMessage);
            const isOwnMessage = socketMessage.senderId === user?.id;

            const newMessage: Message = {
                id: socketMessage.id,
                sender: isOwnMessage ? (user?.role || 'talker') : (partner?.role || 'listener'),
                content: socketMessage.text || '',
                timestamp,
                type: socketMessage.type || 'text',
                audioData: socketMessage.audioData,
                duration: socketMessage.duration,
            };
            
            setMessages(prevMessages => {
                const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
                if (!messageExists) {
                    return [...prevMessages, newMessage];
                }
                return prevMessages;
            });
        };

        socketService.onTextMessage(handleReceivedMessage);
        socketService.onVoiceMessage(handleReceivedMessage);

        socketService.onPartnerTyping(({ isTyping, roomId }) => {
            if (roomId === currentRoom) {
                setPartnerTyping(isTyping);
            }
        });

        socketService.onMessageStatus(() => { /* handle status */ });

    }, [toast, currentRoom, navigate, user, partner, leaveChat]);

    const connectAndSetup = useCallback(async () => {
        if (hasAttemptedConnection.current) return;
        hasAttemptedConnection.current = true;

        try {
            await socketService.connect();
            setIsConnected(true);
            setupEventListeners();
            toast({ title: "Connected", description: "You're now online and ready to chat." });
        } catch (error) {
            console.error('Socket connection failed:', error);
             logout();
            setIsConnected(false);
            hasAttemptedConnection.current = false;
            toast({ title: "Connection Failed", description: "Unable to connect to chat service.", variant: "destructive" });
        }
    }, [toast, user, setupEventListeners , logout]);

    useEffect(() => {
        if (isAuthenticated && user && !socketService.connected) {
            connectAndSetup();
        }

        return () => {
            if (!isAuthenticated) {
                socketService.disconnect();
                setIsConnected(false);
                hasAttemptedConnection.current = false;
            }
        };
    }, [isAuthenticated, user, connectAndSetup]);

    const requestChat = useCallback((talkerId: string) => {
        if (isConnected) {
            socketService.requestChat(talkerId);
        } else {
            toast({
                title: "Not Connected",
                description: "Please wait for connection to be established",
                variant: "destructive"
            });
        }
    }, [isConnected, toast]);

    const sendTextMessage = useCallback((text: string) => {
        if (currentRoom && user) {
            const sanitizedMessage = sanitizeInput(text);
            console.log('user:', user);
            socketService.sendTextMessage(currentRoom, user.id, sanitizedMessage);
        }
    }, [currentRoom, user]);

    const sendVoiceMessage = useCallback((audioData: string, duration: number) => {
        if (currentRoom && user) {
            console.log('Sending voice message with duration:', duration);
            socketService.sendVoiceMessage(currentRoom, user.id, audioData, duration);
        }
    }, [currentRoom, user]);

    const startTyping = useCallback(() => {
        if (currentRoom && isConnected) {
            socketService.startTyping(currentRoom);
        }
    }, [currentRoom, isConnected]);

    const stopTyping = useCallback(() => {
        if (currentRoom && isConnected) {
            socketService.stopTyping(currentRoom);
        }
    }, [currentRoom, isConnected]);

    const markMessageAsRead = useCallback((messageId: string) => {
        if (currentRoom) {
            socketService.markMessageAsRead(messageId, currentRoom);
        }
    }, [currentRoom]);

    const joinWaitingQueue = useCallback(() => {
        if (isConnected) {
            socketService.joinWaitingQueue();
        }
    }, [isConnected]);

    const leaveWaitingQueue = useCallback(() => {
        if (isConnected) {
            socketService.leaveWaitingQueue();
        }
    }, [isConnected]);

    const startLooking = () => socketService.startLooking();
    const stopLooking = () => socketService.stopLooking();
    const disconnectSocket = () => socketService.disconnect();

    const setChatSession = (convoId: string, roomId: string) => {
        localStorage.setItem('currentConvoId', convoId);
        localStorage.setItem('currentRoomId', roomId);
        setCurrentConvoId(convoId);
        setCurrentRoom(roomId);
    };

    const clearChatSession = () => {
        localStorage.removeItem('currentConvoId');
        localStorage.removeItem('currentRoomId');
        localStorage.removeItem('currentPartner');
        setCurrentConvoId(null);
        setCurrentRoom(null);
        setPartner(null);
    };
    
    return {
        isConnected,
        currentRoom,
        partner,
        availableTalkers,
        messages,
        partnerTyping,
        requestChat,
        sendTextMessage,
        sendVoiceMessage,
        startTyping,
        stopTyping,
        leaveChat,
        markMessageAsRead,
        joinWaitingQueue,
        leaveWaitingQueue,
        startLooking,
        stopLooking,
        disconnectSocket ,
        setChatSession,
        clearChatSession,   
        currentConvoId,
        onTextMessage,
        onPartnerDisconnected,
    };
};