/**
 * ChatScreen — message bubble list with real-time WebSockets, polling fallback, and optimistic send.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { messagesApi } from '../api';
import { WS_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';

const POLL_INTERVAL = 3000; // 3 seconds

export default function ChatScreen({ route }) {
  const { requestId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const pollRef = useRef(null);
  const wsRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesApi.list(requestId);
      setMessages((prev) => {
        const fetched = res.data || [];
        const map = new Map();
        [...prev, ...fetched].forEach((m) => {
          if (m.id) map.set(m.id, m);
        });
        return Array.from(map.values()).sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const setupWebSocket = useCallback(() => {
    try {
      const wsUrl = `${WS_BASE_URL}/requests/${requestId}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket Connected to', wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.content) {
            const newMsg = {
              id: data.id || `ws_${Date.now()}`,
              request_id: requestId,
              sender_id: data.sender_id || null,
              sender_role: data.sender_role || (user?.role === 'provider' ? 'customer' : 'provider'),
              content: data.content,
              sent_at: data.sent_at || new Date().toISOString(),
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id || (m.content === newMsg.content && Math.abs(new Date(m.sent_at) - new Date(newMsg.sent_at)) < 2000))) {
                return prev;
              }
              return [...prev, newMsg];
            });
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onerror = (e) => {
        console.log('WebSocket Error:', e.message);
      };

      wsRef.current = ws;
    } catch (e) {
      // Fallback handles polling
    }
  }, [requestId, user?.role]);

  useEffect(() => {
    fetchMessages();
    setupWebSocket();

    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchMessages, setupWebSocket]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic = {
      id: `temp_${Date.now()}`,
      request_id: requestId,
      sender_id: user?.id,
      sender_role: user?.role || 'customer',
      content: text,
      sent_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      await messagesApi.send(requestId, text);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ content: text, sender_id: user?.id, sender_role: user?.role }));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const isMessageFromMe = (msg) => {
    if (msg.sender_id && user?.id) {
      return msg.sender_id === user.id;
    }
    return msg.sender_role === user?.role;
  };

  const renderItem = ({ item }) => (
    <ChatBubble
      content={item.content}
      isMine={isMessageFromMe(item)}
      timestamp={item.sent_at}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.teal} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={Colors.border} />
              <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageList: { paddingVertical: Spacing.md, flexGrow: 1, justifyContent: 'flex-end' },

  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyChatText: { fontSize: 14, color: Colors.muted, marginTop: 8 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.paper,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.ink,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
});
