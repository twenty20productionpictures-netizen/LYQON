import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Phone, Video, MoreVertical, Trash2, Bell, BellOff, Archive, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name?: string;
}

interface Conversation {
  id: string;
  updated_at: string;
  archived?: boolean;
  muted?: boolean;
  other_user_name?: string;
  other_user_type?: string;
}

export default function MessagesPage() {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    const startUserId = searchParams.get('start');
    if (startUserId && user) {
      createOrFindConversation(startUserId);
      setSearchParams({}); // Clear the query param
    }
  }, [searchParams, user, conversations]);

  useEffect(() => {
    if (!selectedConversation) return;
    loadMessages(selectedConversation);

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Get sender profile
          const { data: profile } = await supabase
            .from('public_profiles')
            .select('full_name')
            .eq('user_id', newMsg.sender_id)
            .single();

          setMessages(prev => [...prev, { 
            ...newMsg, 
            sender_name: profile?.full_name
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createOrFindConversation = async (otherUserId: string) => {
    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user?.id);

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId)
            .maybeSingle();

          if (otherParticipant) {
            // Conversation exists, select it
            setSelectedConversation(participant.conversation_id);
            return;
          }
        }
      }

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        toast({
          title: "Error",
          description: "Failed to start conversation",
          variant: "destructive"
        });
        return;
      }

      // Add current user first
      const { error: currentUserError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: newConversation.id, user_id: user?.id });

      if (currentUserError) {
        console.error('Error adding current user:', currentUserError);
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive"
        });
        return;
      }

      // Then add other user
      const { error: otherUserError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: newConversation.id, user_id: otherUserId });

      if (otherUserError) {
        console.error('Error adding other user:', otherUserError);
        toast({
          title: "Error",
          description: "Failed to add participant",
          variant: "destructive"
        });
        return;
      }

      // Reload conversations and select the new one
      await loadConversations();
      setSelectedConversation(newConversation.id);
    } catch (error) {
      console.error('Error in createOrFindConversation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const loadConversations = async () => {
    try {
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, muted, conversations(id, updated_at, archived)')
        .eq('user_id', user?.id);

      if (participantError) throw participantError;

      const convos = participantData?.map(p => ({
        id: p.conversations.id,
        updated_at: p.conversations.updated_at,
        archived: p.conversations.archived,
        muted: p.muted
      })) || [];

      // Get other participants' profiles
      const convosWithProfiles = await Promise.all(
        convos.map(async (convo) => {
          const { data: otherParticipants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', convo.id)
            .neq('user_id', user?.id);

          if (otherParticipants && otherParticipants.length > 0) {
            const { data: profile } = await supabase
              .from('public_profiles')
              .select('full_name, user_type')
              .eq('user_id', otherParticipants[0].user_id)
              .single();

            return {
              ...convo,
              other_user_name: profile?.full_name || 'Unknown User',
              other_user_type: profile?.user_type || 'talent',
              archived: convo.archived,
              muted: convo.muted
            };
          }

          return {
            ...convo,
            other_user_name: 'Unknown User',
            other_user_type: 'talent',
            archived: convo.archived,
            muted: convo.muted
          };
        })
      );

      setConversations(convosWithProfiles);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender names
      const msgsWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('public_profiles')
            .select('full_name')
            .eq('user_id', msg.sender_id)
            .single();

          return { 
            ...msg, 
            sender_name: profile?.full_name 
          };
        })
      );

      setMessages(msgsWithNames);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Delete messages first
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete participants
      await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }
      
      await loadConversations();
      
      toast({
        title: "Success",
        description: "Conversation deleted"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const handleMuteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ muted: true })
        .eq('conversation_id', conversationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadConversations();
      
      toast({
        title: "Success",
        description: "Conversation muted - you won't receive notifications"
      });
    } catch (error) {
      console.error('Error muting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to mute conversation",
        variant: "destructive"
      });
    }
  };

  const handleUnmuteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ muted: false })
        .eq('conversation_id', conversationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadConversations();
      
      toast({
        title: "Success",
        description: "Conversation unmuted"
      });
    } catch (error) {
      console.error('Error unmuting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to unmute conversation",
        variant: "destructive"
      });
    }
  };

  const handleArchiveConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ archived: true })
        .eq('id', conversationId);

      if (error) throw error;

      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }

      await loadConversations();
      
      toast({
        title: "Success",
        description: "Conversation archived"
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast({
        title: "Error",
        description: "Failed to archive conversation",
        variant: "destructive"
      });
    }
  };

  const handleUnarchiveConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ archived: false })
        .eq('id', conversationId);

      if (error) throw error;

      await loadConversations();
      
      toast({
        title: "Success",
        description: "Conversation unarchived"
      });
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      toast({
        title: "Error",
        description: "Failed to unarchive conversation",
        variant: "destructive"
      });
    }
  };

  const filteredConversations = conversations
    .filter((conv) => 
      (showArchived ? conv.archived : !conv.archived) &&
      (conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (!userType) return null;

  return (
    <DashboardLayout userType={userType}>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <Card className="w-80 m-4 flex flex-col">
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Active" : "Archived"}
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No conversations yet</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                {showArchived ? "No archived conversations" : "No active conversations"}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="group relative"
                  >
                    <button
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation === conv.id
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {conv.other_user_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate">{conv.other_user_name}</div>
                            {conv.muted && <MicOff className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {conv.other_user_type}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {showArchived ? (
                            <DropdownMenuItem onClick={(e) => handleUnarchiveConversation(conv.id, e)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Unarchive
                            </DropdownMenuItem>
                          ) : (
                            <>
                              {conv.muted ? (
                                <DropdownMenuItem onClick={(e) => handleUnmuteConversation(conv.id, e)}>
                                  <Bell className="mr-2 h-4 w-4" />
                                  Unmute
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={(e) => handleMuteConversation(conv.id, e)}>
                                  <BellOff className="mr-2 h-4 w-4" />
                                  Mute
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => handleArchiveConversation(conv.id, e)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 m-4 ml-0 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conversations.find(c => c.id === selectedConversation)?.other_user_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {conversations.find(c => c.id === selectedConversation)?.other_user_name || "Unknown"}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {conversations.find(c => c.id === selectedConversation)?.other_user_type || "user"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm">{msg.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
