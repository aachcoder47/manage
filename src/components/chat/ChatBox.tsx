"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChatService, ChatMessage } from "@/services/chat.service";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ChatBoxProps {
    trialId: string;
    otherUserId: string; // The person we are chatting with
    otherUserName?: string;
}

export default function ChatBox({ trialId, otherUserId, otherUserName = "User" }: ChatBoxProps) {
    const { user } = useUser();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await ChatService.getMessages(trialId);
                setMessages(data);
                scrollToBottom();
            } catch (error) {
                console.error("Failed to load messages", error);
            }
        };

        loadMessages();

        const channel = ChatService.subscribeToMessages(trialId, (msg) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        });

        return () => {
            channel.unsubscribe();
        };
    }, [trialId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !user) {return;}
        setSending(true);
        try {
            await ChatService.sendMessage({
                work_trial_id: trialId,
                sender_id: user.id,
                receiver_id: otherUserId,
                content: newMessage
            });
            setNewMessage("");
            scrollToBottom();
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    if (!user) {return null;}

    return (
        <div className="flex flex-col h-[500px] border rounded-lg bg-white shadow-sm">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-sm">Chat with {otherUserName}</h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground py-10">No messages yet. Start the conversation!</p>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                    isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                                }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-3 border-t flex gap-2">
                <Input 
                    value={newMessage} 
                    placeholder="Type a message..."
                    className="flex-1"
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <Button size="icon" disabled={sending || !newMessage.trim()} onClick={handleSend}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
}
