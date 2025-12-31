import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type ChatMessage = {
    id: string;
    created_at: string;
    sender_id: string;
    receiver_id: string;
    work_trial_id?: string;
    content: string;
    is_read: boolean;
};

const supabase = createClientComponentClient();

const getMessages = async (trialId: string) => {
    const { data, error } = await supabase
        .from("chat_message")
        .select("*")
        .eq("work_trial_id", trialId)
        .order("created_at", { ascending: true });

    if (error) {throw new Error(error.message);}
    return data as ChatMessage[];
};

const sendMessage = async (payload: Partial<ChatMessage>) => {
    const { data, error } = await supabase
        .from("chat_message")
        .insert(payload)
        .select()
        .single();

    if (error) {throw new Error(error.message);}
    return data as ChatMessage;
};

const subscribeToMessages = (trialId: string, callback: (msg: ChatMessage) => void) => {
    return supabase
        .channel(`chat:${trialId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_message',
                filter: `work_trial_id=eq.${trialId}`
            },
            (payload) => {
                callback(payload.new as ChatMessage);
            }
        )
        .subscribe();
};

export const ChatService = {
    getMessages,
    sendMessage,
    subscribeToMessages
};
