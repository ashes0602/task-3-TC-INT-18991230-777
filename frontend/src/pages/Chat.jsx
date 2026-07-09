import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const socket = useRef();
  const scrollRef = useRef();

  // Initialize Socket
  useEffect(() => {
    if (user) {
      socket.current = io('http://localhost:5000');
      socket.current.emit('addUser', user._id);
      socket.current.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });
      socket.current.on('getMessage', (data) => {
        // If the incoming message is from the currently active chat
        if (currentChatUser && currentChatUser._id === data.sender) {
          setMessages((prev) => [...prev, data]);
        }
        // Always refresh conversations to update sidebar
        fetchConversations();
      });
    }
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user, currentChatUser]);

  // Fetch Conversations list
  const fetchConversations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/messages/conversations', config);
      setConversations(data);
      
      // If we came here from a "Message Seller" button, open that chat immediately
      if (initialUserId) {
        const existingConvo = data.find(c => c.user._id === initialUserId);
        if (existingConvo) {
          setCurrentChatUser(existingConvo.user);
        } else {
          // If no existing conversation, we still need to load the user info
          // We can fetch a single user, but since we don't have a specific endpoint for user public profile,
          // we'll just set the ID and let the user send the first message
          setCurrentChatUser({ _id: initialUserId, name: 'New Contact...' });
        }
        // Remove the query param so it doesn't get stuck
        setSearchParams({});
      }

    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, initialUserId]);

  // Fetch messages for active chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChatUser) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`http://localhost:5000/api/messages/${currentChatUser._id}`, config);
          setMessages(data);
          
          // Mark as read
          await axios.put(`http://localhost:5000/api/messages/${currentChatUser._id}/read`, {}, config);
          fetchConversations(); // Update unread indicators
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    fetchMessages();
  }, [currentChatUser]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChatUser) return;

    const messageData = {
      senderId: user._id,
      receiverId: currentChatUser._id,
      content: newMessage
    };

    // Emit via socket
    socket.current.emit('sendMessage', messageData);

    // Optimistically update UI
    setMessages([...messages, { ...messageData, sender: user._id, createdAt: new Date().toISOString() }]);
    setNewMessage('');
    
    // The backend actually saves the message emitted via socket, so we don't strictly need to do an axios.post here, 
    // but the socket implementation in server.js does save it. 
    // To ensure the sidebar updates correctly, we refresh conversations.
    setTimeout(fetchConversations, 500);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex overflow-hidden bg-white shadow-lg border-t border-gray-100">
      
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const isActive = currentChatUser && currentChatUser._id === c.user._id;
              const isUnread = c.latestMessage?.read === false && c.latestMessage?.receiver === user._id;
              const isOnline = onlineUsers.includes(c.user._id);

              return (
                <div 
                  key={c.user._id} 
                  onClick={() => setCurrentChatUser(c.user)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition flex items-center ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                >
                  <div className="relative">
                    <img src={c.user.profilePicture || `https://ui-avatars.com/api/?name=${c.user.name}`} alt={c.user.name} className="w-12 h-12 rounded-full object-cover" />
                    {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`font-medium ${isUnread ? 'text-black font-bold' : 'text-gray-900'}`}>{c.user.name}</h3>
                      <span className="text-xs text-gray-500">
                        {c.latestMessage && new Date(c.latestMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                      {c.latestMessage?.content || 'Started a conversation'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="w-2/3 flex flex-col bg-white">
        {currentChatUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center shadow-sm">
              <img src={currentChatUser.profilePicture || `https://ui-avatars.com/api/?name=${currentChatUser.name}`} alt={currentChatUser.name} className="w-10 h-10 rounded-full" />
              <div className="ml-4">
                <h3 className="font-bold text-gray-900">{currentChatUser.name}</h3>
                <p className="text-xs text-gray-500">{onlineUsers.includes(currentChatUser._id) ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
              {messages.map((msg, index) => {
                const isMine = msg.sender === user._id;
                return (
                  <div key={msg._id || index} ref={scrollRef} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Send a message to start the conversation.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-sm">
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-medium text-gray-800">Select a conversation</h2>
            <p className="mt-2">Choose an existing conversation or start a new one from a product/service page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
