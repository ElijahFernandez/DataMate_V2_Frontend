import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { Box, Button, TextField, CircularProgress, Typography } from "@mui/material";
import axios from 'axios';

interface ChatboxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: "user" | "taskweaver";
}

const Chatbox: React.FC<ChatboxProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (input.trim() !== '') {
      const userMessage: Message = { text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post('http://localhost:5000/chat', {
          message: input
        });

        const taskweaverMessage = response.data.message;
        setMessages(prevMessages => [...prevMessages, { text: taskweaverMessage, sender: 'taskweaver' }]);
      } catch (error) {
        console.error('Error calling backend API:', error);
        setError('Failed to get response from server');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await sendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "70px",
        right: "20px",
        width: "300px",
        height: "400px",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "10px",
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        <Typography variant="h6">Chat with TaskWeaver</Typography>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <Box
              sx={{
                padding: "10px",
                backgroundColor:
                  message.sender === "user" ? "#71C887" : "#f1f1f1",
                borderRadius: "10px",
                maxWidth: "70%",
                wordWrap: "break-word",
              }}
            >
              {message.text}
            </Box>
          </Box>
        ))}
        {isLoading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      <Box
        sx={{
          display: "flex",
          borderTop: "1px solid #ddd",
          paddingTop: "10px",
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          variant="outlined"
          size="small"
        />
        <Button onClick={sendMessage}>Send</Button>
      </Box>
    </Box>
  );
};

export default Chatbox;