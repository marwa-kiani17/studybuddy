import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';  // Import CSS for styling
import panda from './panda.jpg'; // Import the panda image
import Header from './Header';
import {jwtDecode} from "jwt-decode"; // Import jwt-decode if not already imported


function Chatbot() {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]); // List of user chats
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatName, setChatName] = useState('');
  const chatBoxRef = useRef(null); // For auto-scrolling

  // Fetch user's chats on component mount
    useEffect(() => {
      const fetchChats = async () => {
        try {
          const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage
          if (!token) {
            console.error("Auth token not found");
            return;
          }
    
          const decodedToken = jwtDecode(token); // Decode the token
          const userId = decodedToken.user_id; // Extract the user_id from the token
    
          // Fetch user chats
          const response = await axios.get(`http://localhost:5000/get_user_chats/${userId}`);
          const fetchedChats = response.data.chats;
    
          setChats(fetchedChats);
    
          // If no chats exist, create a new one automatically
          if (fetchedChats.length === 0) {
            await handleNewChat("New Chat");
          } else {
            setActiveChatId(fetchedChats[0].chat_id); // Set the first chat as active by default
          }
        } catch (error) {
          console.error("Error fetching chats:", error);
        }
      };
    
      fetchChats();
    }, []); // Only runs on component mount

  // Fetch specific chat when active chat changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (activeChatId) {
        const response = await axios.get(`http://localhost:5000/get_chat/${activeChatId}`);
        setChatHistory(response.data.messages);
      }
    };
    fetchChatHistory();
  }, [activeChatId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; // Auto-scroll to the latest message
    }
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newChatHistory = [...chatHistory, { sender: 'user', message: userMessage }];
    setChatHistory(newChatHistory);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/send_message', {
        chat_id: activeChatId,
        message: userMessage,
        sender: 'user'
      });

      const botMessage = response.data.bot_message;
      setChatHistory([...newChatHistory, { sender: 'bot', message: botMessage, feedback: null }]);
    } catch (error) {
      setChatHistory([...newChatHistory, { sender: 'bot', message: 'Error in response. Please try again.' }]);
    } finally {
      setLoading(false);
      setUserMessage('');
    }
  };

  const submitFeedback = async (chat_id, bot_message, feedbackType) => {
    try {
      console.log(`Submitting feedback: ${feedbackType} for message: ${bot_message}`);  // Log feedback to console
      await axios.post('http://localhost:5000/submit_feedback', {
        chat_id,
        bot_message,
        feedback: feedbackType
      });

      // Update feedback state after submission
      const updatedHistory = chatHistory.map((chat) => {
        if (chat.message === bot_message) {
          return { ...chat, feedback: feedbackType };  // Remove thumbs after feedback
        }
        return chat;
      });
      setChatHistory(updatedHistory);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = async (defaultName = chatName.trim()) => {
    if (!defaultName) return;
  
    try {
      const token = localStorage.getItem("authToken"); // Retrieve the auth token from localStorage
      if (!token) {
        console.error("Auth token not found");
        return;
      }
  
      const decodedToken = jwtDecode(token); // Decode the token to get the user_id
      const userId = decodedToken.user_id; // Extract user_id from the token
  
      // Make the API call to create a new chat
      const response = await axios.post("http://localhost:5000/create_chat", {
        user_id: userId,
        chat_name: defaultName,
      });
  
      const newChat = { chat_id: response.data.chat_id, chat_name: defaultName };
      setChats([...chats, newChat]); // Add the new chat to the chats state
      setActiveChatId(newChat.chat_id); // Set the new chat as the active chat
      setChatName(""); // Clear the chat name input
      setChatHistory([]); // Clear chat history for the new chat
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <div className="chatbot-container">
      <Header />

      <div className="chat-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <button 
              onClick={() => handleNewChat()} 
              className="new-chat-button" 
              disabled={!chatName.trim()}
              style={{
                backgroundColor: chatName.trim() ? '#BC7BDA' : '#ccc',
                color: '#fff',
                cursor: chatName.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              + New Chat
            </button>
            <input
              type="text"
              placeholder="Enter chat name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="chat-name-input"
              style={{ color: 'black' }}
            />
          </div>
          <ul className="chat-list">
            {chats.map((chat) => (
              <li
                key={chat.chat_id}
                className={`chat-list-item ${activeChatId === chat.chat_id ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.chat_id)}
              >
                {chat.chat_name}
              </li>
            ))}
          </ul>
        </aside>

        <div className="chat-container">
          <div className="chat-header">
            <h3 className={!activeChatId ? 'center-text' : ''}>
              {activeChatId ? '' : "How can I help you?"}
            </h3>
          </div>

          <div className="chat-box" ref={chatBoxRef}>
  {chatHistory.map((chat, index) => (
    <div key={index} className={chat.sender === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper'}>
      {chat.sender === 'user' ? (
        <div className="user-message">
          <p>{chat.message}</p>
        </div>
      ) : (
        <div className="bot-message">
          <div className="bot-avatar">
            <img src={panda} alt="Bot Avatar" /> {/* Use the panda image */}
          </div>
          <div className="bot-message-content">
            <p dangerouslySetInnerHTML={{ __html: chat.message }} />
            {!chat.feedback && (
              <div className="feedback-buttons">
                <button onClick={() => submitFeedback(activeChatId, chat.message, 'positive')}>👍</button>
                <button onClick={() => submitFeedback(activeChatId, chat.message, 'negative')}>👎</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ))}
  {loading && (
    <div className="typing-indicator">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  )}
</div>


          {activeChatId && (
            <div className="chat-input-wrapper">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message here"
                onKeyPress={handleKeyPress}
              />
              <button 
                onClick={sendMessage} 
                disabled={loading || !userMessage.trim()}
                style={{
                  backgroundColor: userMessage.trim() ? '#BC7BDA' : '#ccc',
                  cursor: userMessage.trim() ? 'pointer' : 'not-allowed',
                  color: '#fff'
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
