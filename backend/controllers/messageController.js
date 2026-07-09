import Message from '../models/Message.js';
import User from '../models/User.js';

// Get conversation with a specific user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a list of users the current user has chatted with
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages where the current user is either sender or receiver
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    }).sort({ createdAt: -1 });

    const userMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.sender.toString() === currentUserId.toString() 
        ? msg.receiver.toString() 
        : msg.sender.toString();
      
      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, msg);
      }
    });

    const conversationUsersIds = Array.from(userMap.keys());
    const users = await User.find({ _id: { $in: conversationUsersIds } }).select('name email profilePicture');

    // Attach latest message to the user object
    const conversations = users.map(user => {
      return {
        user,
        latestMessage: userMap.get(user._id.toString())
      };
    });

    // Sort conversations by latest message time
    conversations.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { sender: senderId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
