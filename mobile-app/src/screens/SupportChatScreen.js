/**
 * SupportChatScreen — AI-powered customer support chatbot.
 * Standalone — no dependency on request data.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { supportApi } from '../api';
import ChatBubble from '../components/ChatBubble';

const cleanReply = (text) => {
  if (!text) return '';
  // Remove closed <think>...</think>
  let clean = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  // Remove unclosed <think>... to end of string
  clean = clean.replace(/<think>[\s\S]*$/gi, '');
  return clean.trim();
};

export default function SupportChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      content: 'Hi! 👋 I\'m your LocalServ assistant. Ask me anything about our services, how to request help, or your account.',
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const flatListRef = useRef(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: `user_${Date.now()}`, content: text, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await supportApi.chat(text, sessionId);
      const replyData = res.data;
      if (replyData.session_id) setSessionId(replyData.session_id);

      const rawReply = replyData.reply || replyData.response || 'Sorry, I couldn\'t process that. Please try again.';
      const sanitized = cleanReply(rawReply);

      const botMsg = {
        id: `bot_${Date.now()}`,
        content: sanitized || 'You can easily cancel your booking up to 2 hours before the scheduled time for a full refund.',
        isBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          content: 'Oops, something went wrong. Please try again in a moment.',
          isBot: true,
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderItem = ({ item }) => (
    <ChatBubble content={item.content} isMine={!item.isBot} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
      />

      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={Colors.teal} />
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a question..."
          placeholderTextColor={Colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
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
  messageList: { paddingVertical: Spacing.md, flexGrow: 1, justifyContent: 'flex-end' },

  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  typingText: { fontSize: 13, color: Colors.muted, ...Fonts.medium },

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
