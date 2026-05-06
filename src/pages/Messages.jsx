import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Users, Flag, Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Messages() {
  const queryClient = useQueryClient();
  const [activeConv, setActiveConv] = useState(null); // { type: 'dm'|'race', id, label }
  const [newMsg, setNewMsg] = useState('');
  const bottomRef = useRef(null);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const { data: races = [] } = useQuery({ queryKey: ['races'], queryFn: () => base44.entities.Race.list('-date', 50) });
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
    refetchInterval: 4000,
  });

  const myPilot = pilots.find(p => p.created_by === me?.email);

  // My DM conversations: unique users I've messaged or who messaged me
  const dmConversations = React.useMemo(() => {
    const dmMsgs = messages.filter(m => m.type === 'dm' && (m.sender_id === me?.id || m.recipient_id === me?.id));
    const partnerMap = new Map();
    dmMsgs.forEach(m => {
      const partnerId = m.sender_id === me?.id ? m.recipient_id : m.sender_id;
      const partnerName = m.sender_id === me?.id ? m.recipient_username : m.sender_username;
      if (!partnerMap.has(partnerId)) partnerMap.set(partnerId, { id: partnerId, username: partnerName, lastMsg: m });
      else {
        const existing = partnerMap.get(partnerId);
        if (new Date(m.created_date) > new Date(existing.lastMsg.created_date)) {
          partnerMap.set(partnerId, { ...existing, lastMsg: m });
        }
      }
    });
    return [...partnerMap.values()].sort((a,b) => new Date(b.lastMsg.created_date) - new Date(a.lastMsg.created_date));
  }, [messages, me]);

  // Race chats for races I'm registered in
  const myRaceIds = React.useMemo(() => {
    return races.filter(r => r.registered_pilot_ids?.includes(myPilot?.id)).map(r => r.id);
  }, [races, myPilot]);

  // Current conversation messages
  const convMessages = React.useMemo(() => {
    if (!activeConv) return [];
    if (activeConv.type === 'race') {
      return messages.filter(m => m.type === 'race_chat' && m.race_id === activeConv.id)
        .sort((a,b) => new Date(a.created_date) - new Date(b.created_date));
    }
    return messages.filter(m =>
      m.type === 'dm' &&
      ((m.sender_id === me?.id && m.recipient_id === activeConv.id) ||
       (m.sender_id === activeConv.id && m.recipient_id === me?.id))
    ).sort((a,b) => new Date(a.created_date) - new Date(b.created_date));
  }, [messages, activeConv, me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
  });

  const handleSend = () => {
    if (!newMsg.trim() || !activeConv || !me || !myPilot) return;
    const payload = {
      type: activeConv.type === 'race' ? 'race_chat' : 'dm',
      sender_id: me.id,
      sender_username: myPilot.username,
      content: newMsg.trim(),
    };
    if (activeConv.type === 'race') payload.race_id = activeConv.id;
    else { payload.recipient_id = activeConv.id; payload.recipient_username = activeConv.label; }
    sendMutation.mutate(payload);
    setNewMsg('');
  };

  const [pilotSearch, setPilotSearch] = useState('');
  const searchedPilots = pilots.filter(p =>
    p.id !== myPilot?.id && pilotSearch &&
    p.username?.toLowerCase().includes(pilotSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="flex gap-0 h-[calc(100vh-130px)] rounded-xl overflow-hidden border border-border racing-card">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="font-heading text-base text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />Messaggi
          </h1>
        </div>

        {/* Race chats */}
        <div className="p-3 border-b border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
            <Flag className="w-3 h-3" />Chat Gare
          </p>
          {myRaceIds.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">Nessuna gara a cui sei iscritto</p>
          )}
          {myRaceIds.map(raceId => {
            const race = races.find(r => r.id === raceId);
            if (!race) return null;
            const unread = messages.filter(m => m.type === 'race_chat' && m.race_id === raceId).length;
            return (
              <button
                key={raceId}
                onClick={() => setActiveConv({ type: 'race', id: raceId, label: race.title })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1",
                  activeConv?.id === raceId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                )}
              >
                <p className="font-medium truncate">{race.title}</p>
                <p className="text-muted-foreground">{race.track}</p>
              </button>
            );
          })}
        </div>

        {/* DMs */}
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />Messaggi Diretti
          </p>
          {/* Search pilot */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              value={pilotSearch}
              onChange={e => setPilotSearch(e.target.value)}
              placeholder="Cerca pilota..."
              className="pl-7 h-7 text-xs bg-background border-border"
            />
          </div>
          {searchedPilots.map(p => (
            <button
              key={p.id}
              onClick={() => { setActiveConv({ type: 'dm', id: p.id, label: p.username }); setPilotSearch(''); }}
              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-foreground hover:bg-secondary transition-colors flex items-center gap-2 mb-1"
            >
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-heading text-[10px]">
                {p.username?.[0]?.toUpperCase()}
              </div>
              {p.username}
            </button>
          ))}

          {dmConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConv({ type: 'dm', id: conv.id, label: conv.username })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1",
                activeConv?.id === conv.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-heading text-[10px] flex-shrink-0">
                  {conv.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{conv.username}</p>
                  <p className="text-muted-foreground truncate">{conv.lastMsg.content}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-background/50">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <MessageSquare className="w-14 h-14 opacity-20" />
            <p className="text-sm">Seleziona una conversazione</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {activeConv.type === 'race'
                  ? <Flag className="w-4 h-4 text-primary" />
 