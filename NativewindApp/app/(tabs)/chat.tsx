import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { useMeQuery } from "@/services/authApi";
import { Redirect } from "expo-router";

const HUB_URL = process.env.EXPO_PUBLIC_API_URL + "chathub"
// 'http://192.168.0.143:5207/chathub';
// const HUB_URL ='https://p32-native.itstep.click/chat';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export default function Chat() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");

  const { data: user, error, refetch } = useMeQuery();

  if(user == null) {
    return <SafeAreaView>
        <Text className="mx-auto">
           could not fetch user
        </Text>
    </SafeAreaView>
  }
//   if(user == null) {
//     return <Redirect href={"/(auth)/login"}></Redirect>
//   }
  const username = user.email;
  
  const flatListRef = useRef<FlatList>(null);

  // 1. Manage SignalR Lifecycle
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        setIsConnected(true);
        setIsLoading(false);

        // 2. Set up event listener matching your C# hub method name
        // newConnection.on("ReceiveMessage", (messageText: string) => {
        newConnection.on("Send", (incomingData: { username: string; text: string }) => {
          const newMsg: Message = {
            id: Math.random().toString(),
            username: incomingData.username,
            text: incomingData.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        });
      })
      .catch((error) => {
        console.error("SignalR Connection Error: ", error);
        setIsLoading(false);
      });

    // Clean up connections when user leaves the page
    return () => {
      if (newConnection) {
        // newConnection.off("ReceiveMessage");
        newConnection.off("Send");
        newConnection.stop();
      }
    };
  }, []);

  // 3. Send Message to the Hub
  const handleSendMessage = async () => {
    if (!inputText.trim() || !connection || !isConnected) return;

    try {
      // Calls public async Task SendMessage(string msg) in C# Hub
    //   await connection.invoke("SendMessage", inputText);
      await connection.invoke("Send", {username: username, text: inputText});
      setInputText("");
    } catch (error) {
      console.error("Failed to send message: ", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Connecting to chat live stream...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Chat</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? "#4cd964" : "#ff3b30" }]} />
            <Text style={styles.statusText}>{isConnected ? "Connected" : "Disconnected"}</Text>
          </View>
        </View>

        {/* Message Thread List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            // 👥 Evaluate identity: Is this bubble mine or theirs?
            const isMyMessage = item.username === username;

            return (
              <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.theirMessage
              ]}>
                {!isMyMessage && <Text style={styles.senderText}>{item.username}</Text>}
                <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                  {item.text}
                </Text>
                <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
                  {item.timestamp}
                </Text>
              </View>
            );
          }}
        />

        {/* Text Entry Footer Bar */}
        <SafeAreaView edges={['bottom']} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.6 }]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
   myMessage: {
    alignSelf: 'flex-end',          // Aligns layout to right margin
    backgroundColor: '#0066cc',     // Vibrant theme
    borderColor: '#0052a3',
  },
  theirMessage: {
    alignSelf: 'flex-start',         // Aligns layout to left margin
    backgroundColor: '#fff',        // Neutral white card
    borderColor: '#e0e0e0',
  },
   senderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',                  // White text readability shift over blue
  },
  myTimestamp: {
    color: '#b3d1ff',
    alignSelf: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#0066cc',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
