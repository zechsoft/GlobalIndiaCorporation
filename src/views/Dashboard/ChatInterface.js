// ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Avatar,
  Heading,
  IconButton,
  Divider,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';

import {
  FiSend,
  FiMoreVertical,
  FiPlus,
  FiUser,
  FiUsers,
  FiChevronLeft,
  FiPaperclip
} from 'react-icons/fi';

// Socket connection variable
let socket;

function ChatInterface() {
  // State variables
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Ref for message container to scroll to bottom
  const messageEndRef = useRef(null);

  // Group chat modal controls
  const { isOpen: isCreateGroupOpen, onOpen: onCreateGroupOpen, onClose: onCreateGroupClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Toast for notifications
  const toast = useToast();

  // Check if user is on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize user data and socket connection
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      
      // Initialize socket
      socket = io("http://localhost:8000");
      socket.emit("add-user", userData._id);
      
      // Socket event listeners
      socket.on("online-users", (users) => {
        setOnlineUsers(users);
      });
      
      socket.on("typing", ({ chatId, userId }) => {
        if (selectedChat?._id === chatId) {
          setTypingUsers(prev => ({ ...prev, [userId]: true }));
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => ({ ...prev, [userId]: false }));
          }, 3000);
        }
      });
      
      socket.on("receive-message", (data) => {
        if (selectedChat?._id === data.chatId) {
          setMessages(prev => [...prev, data.message]);
          // Mark as read
          socket.emit("mark-read", { chatId: data.chatId, userId: userData._id });
        } else {
          // Update the unread count or notify
          toast({
            title: "New message",
            description: `You have a new message in ${getRecipientName(data.chatId)}`,
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
        
        // Update chats list to reflect new message
        setFetchAgain(prev => !prev);
      });
      
      socket.on("messages-read", ({ chatId }) => {
        if (selectedChat?._id === chatId) {
          setMessages(prev => 
            prev.map(msg => ({
              ...msg,
              readBy: msg.readBy.includes(userData._id) 
                ? msg.readBy 
                : [...msg.readBy, userData._id]
            }))
          );
        }
      });
      
      // Fetch chats
      fetchChats();
      fetchAllUsers();
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Fetch user's chats
  // Fetch user's chats
const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:8000/api/chat", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        }
      });
      setChats(data.chats);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error fetching chats",
        description: error.response?.data?.error || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };
  // Fetch all users for creating chats
  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.post("http://localhost:8000/api/get-clients", {}, {
        withCredentials: true
      });
      setAllUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Refetch chats when fetchAgain changes
  useEffect(() => {
    fetchChats();
  }, [fetchAgain]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Mobile view - hide chat list when a chat is selected
      if (isMobileView) {
        setShowChatList(false);
      }
    }
  }, [selectedChat]);

  // Function to fetch messages for selected chat
  const fetchMessages = async () => {
    if (!selectedChat) return;
    
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:8000/api/chat/${selectedChat._id}/messages`, {
        withCredentials: true
      });
      setMessages(data.messages);
      
      // Mark messages as read
      socket.emit("mark-read", { chatId: selectedChat._id, userId: user._id });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error fetching messages",
        description: error.response?.data?.error || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (messageInput.trim() === "" || !selectedChat) return;
    
    const tempMessageInput = messageInput;
    setMessageInput("");
    
    try {
      if (selectedChat.isGroupChat) {
        socket.emit("group-message", {
          chatId: selectedChat._id,
          message: tempMessageInput
        });
      } else {
        const recipientId = selectedChat.members.find(m => m._id !== user._id)?._id;
        
        socket.emit("private-message", {
          to: recipientId,
          message: tempMessageInput,
          chatId: selectedChat._id
        });
      }
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Unable to send message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle typing notification
  const handleTyping = () => {
    if (!selectedChat) return;
    socket.emit("typing", { chatId: selectedChat._id, userId: user._id });
  };

  // Create new chat with user
  const createChat = async (userId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`http://localhost:8000/api/chat/private`, {
        userId: user._id,
        receiverId: userId
      }, {
        withCredentials: true
      });
      
      if (!chats.find(c => c._id === data.chat._id)) {
        setChats([data.chat, ...chats]);
      }
      setSelectedChat(data.chat);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error creating chat",
        description: error.response?.data?.error || "Failed to create chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };
  
  // Create group chat
  const createGroupChat = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toast({
        title: "Please fill all fields",
        description: "Group chat requires a name and at least 2 members",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await axios.post(`http://localhost:8000/api/chat/group`, {
        name: groupChatName,
        members: selectedUsers.map(u => u._id),
        userId: user._id
      }, {
        withCredentials: true
      });
      
      setChats([data.chat, ...chats]);
      onCreateGroupClose();
      setGroupChatName("");
      setSelectedUsers([]);
      setSelectedChat(data.chat);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error creating group chat",
        description: error.response?.data?.error || "Failed to create group chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Handle user selection for group chat
  const handleUserSelect = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Get recipient name for chat title
  const getRecipientName = (chatId) => {
    const chat = chats.find(c => c._id === chatId);
    if (!chat) return "Chat";
    
    if (chat.isGroupChat) {
      return chat.name;
    }
    
    const recipient = chat.members.find(m => m._id !== user?._id);
    return recipient?.userName || "User";
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (chat.isGroupChat) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const recipient = chat.members.find(m => m._id !== user?._id);
      return recipient?.userName.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  // Filter users for new chat
  const filteredUsers = allUsers.filter(u => 
    u._id !== user?._id && u.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Flex w="full" h="calc(100vh - 80px)" overflow="hidden">
      {/* Left sidebar for chat list */}
      {(showChatList || !isMobileView) && (
        <Flex
          direction="column"
          w={{ base: "100%", md: "350px" }}
          borderRight="1px solid"
          borderColor="gray.200"
          bg="white"
          h="full"
        >
          {/* Chat list header */}
          <Flex
            justify="space-between"
            align="center"
            p="4"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Heading size="md">Chats</Heading>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<FiPlus />}
                variant="ghost"
              />
              <MenuList>
                <MenuItem
                  icon={<FiUser />}
                  onClick={() => setSearchQuery("")}
                >
                  New Chat
                </MenuItem>
                <MenuItem
                  icon={<FiUsers />}
                  onClick={onCreateGroupOpen}
                >
                  New Group
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          
          {/* Search input */}
          <Box p="3">
            <Input
              placeholder="Search users or chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="md"
            />
          </Box>
          
          {/* Chat list */}
          <Box overflowY="auto" flex="1">
            {/* User search results */}
            {searchQuery && filteredUsers.length > 0 && (
              <Box>
                <Text px="4" py="2" fontWeight="bold" color="gray.500">
                  Users
                </Text>
                {filteredUsers.map(u => (
                  <Flex
                    key={u._id}
                    align="center"
                    p="3"
                    mx="2"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => createChat(u._id)}
                  >
                    <Avatar size="sm" name={u.userName} mr="3" />
                    <Box flex="1">
                      <Text fontWeight="medium">{u.userName}</Text>
                      <Text fontSize="xs" color="gray.500">{u.Email}</Text>
                    </Box>
                    <Badge colorScheme={isUserOnline(u._id) ? "green" : "gray"}>
                      {isUserOnline(u._id) ? "Online" : "Offline"}
                    </Badge>
                  </Flex>
                ))}
                <Divider my="2" />
              </Box>
            )}
            
            {/* Recent chats header */}
            <Text px="4" py="2" fontWeight="bold" color="gray.500">
              Recent Chats
            </Text>
            
            {/* Chat list */}
            {loading && !chats.length ? (
              <Text textAlign="center" p="4">Loading...</Text>
            ) : filteredChats.length === 0 ? (
              <Text textAlign="center" p="4">No chats found</Text>
            ) : (
              filteredChats.map(chat => (
                <Flex
                  key={chat._id}
                  align="center"
                  p="3"
                  mx="2"
                  borderRadius="md"
                  bg={selectedChat?._id === chat._id ? "blue.50" : "white"}
                  cursor="pointer"
                  _hover={{ bg: selectedChat?._id === chat._id ? "blue.50" : "gray.100" }}
                  onClick={() => setSelectedChat(chat)}
                >
                  <Avatar
                    size="sm"
                    name={chat.isGroupChat
                      ? chat.name
                      : chat.members.find(m => m._id !== user?._id)?.userName}
                    mr="3"
                  />
                  <Box flex="1">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="medium" noOfLines={1}>
                        {chat.isGroupChat
                          ? chat.name
                          : chat.members.find(m => m._id !== user?._id)?.userName}
                      </Text>
                      {chat.lastMessage && (
                        <Text fontSize="xs" color="gray.500">
                          {formatTime(chat.lastMessage.createdAt)}
                        </Text>
                      )}
                    </Flex>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {chat.lastMessage
                        ? `${chat.lastMessage.sender._id === user?._id ? "You: " : ""}${chat.lastMessage.message}`
                        : "No messages yet"}
                    </Text>
                  </Box>
                  {chat.isGroupChat && (
                    <Badge ml="1" colorScheme="purple" fontSize="xs">
                      Group
                    </Badge>
                  )}
                  {!chat.isGroupChat && isUserOnline(chat.members.find(m => m._id !== user?._id)?._id) && (
                    <Badge ml="1" colorScheme="green" fontSize="xs">
                      Online
                    </Badge>
                  )}
                </Flex>
              ))
            )}
          </Box>
        </Flex>
      )}
      
      {/* Right side - Chat area */}
      {(selectedChat || !isMobileView) && (
        <Flex
          direction="column"
          flex="1"
          h="full"
          bg="gray.50"
          display={isMobileView && showChatList ? "none" : "flex"}
        >
          {selectedChat ? (
            <>
              {/* Chat header */}
              <Flex
                align="center"
                p="3"
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                {isMobileView && (
                  <IconButton
                    icon={<FiChevronLeft />}
                    aria-label="Back"
                    variant="ghost"
                    mr="2"
                    onClick={() => setShowChatList(true)}
                  />
                )}
                <Avatar
                  size="sm"
                  name={selectedChat.isGroupChat
                    ? selectedChat.name
                    : selectedChat.members.find(m => m._id !== user?._id)?.userName}
                  mr="3"
                />
                <Box flex="1">
                  <Text fontWeight="medium">
                    {selectedChat.isGroupChat
                      ? selectedChat.name
                      : selectedChat.members.find(m => m._id !== user?._id)?.userName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {selectedChat.isGroupChat
                      ? `${selectedChat.members.length} members`
                      : isUserOnline(selectedChat.members.find(m => m._id !== user?._id)?._id)
                        ? "Online"
                        : "Offline"}
                  </Text>
                </Box>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<FiMoreVertical />}
                    variant="ghost"
                  />
                  <MenuList>
                    {selectedChat.isGroupChat && selectedChat.admin?._id === user?._id && (
                      <MenuItem>Manage Group</MenuItem>
                    )}
                    <MenuItem>Clear Chat</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              
              {/* Messages area */}
              <Box flex="1" overflowY="auto" p="3">
                {loading ? (
                  <Text textAlign="center" p="4">Loading messages...</Text>
                ) : messages.length === 0 ? (
                  <Text textAlign="center" p="4" color="gray.500">
                    No messages yet. Start the conversation!
                  </Text>
                ) : (
                  messages.map((msg, index) => (
                    <Box
                      key={msg._id || index}
                      mb="3"
                      alignSelf={msg.sender._id === user?._id ? "flex-end" : "flex-start"}
                    >
                      <Flex direction={msg.sender._id === user?._id ? "row-reverse" : "row"}>
                        <Avatar
                          size="xs"
                          name={msg.sender.userName}
                          ml={msg.sender._id === user?._id ? "2" : "0"}
                          mr={msg.sender._id === user?._id ? "0" : "2"}
                        />
                        <Box
                          maxW="70%"
                          bg={msg.sender._id === user?._id ? "blue.500" : "white"}
                          color={msg.sender._id === user?._id ? "white" : "black"}
                          p="3"
                          borderRadius="lg"
                          boxShadow="sm"
                        >
                          {selectedChat.isGroupChat && msg.sender._id !== user?._id && (
                            <Text fontSize="xs" fontWeight="bold" mb="1">
                              {msg.sender.userName}
                            </Text>
                          )}
                          <Text>{msg.message}</Text>
                          <Flex justify="flex-end" mt="1">
                            <Text fontSize="xs" opacity="0.8">
                              {formatTime(msg.createdAt)}
                              {msg.sender._id === user?._id && (
                                <Text as="span" ml="1">
                                  {msg.readBy.length > 1 ? " ✓✓" : " ✓"}
                                </Text>
                              )}
                            </Text>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  ))
                )}
                {Object.keys(typingUsers).map(userId =>
                  typingUsers[userId] && userId !== user?._id && (
                    <Text key={userId} fontSize="xs" color="gray.500" ml="2" mb="2">
                      {`${selectedChat.members.find(m => m._id === userId)?.userName || "Someone"} is typing...`}
                    </Text>
                  )
                )}
                <div ref={messageEndRef} />
              </Box>
              
              {/* Message input */}
              <Flex
                p="3"
                bg="white"
                borderTop="1px solid"
                borderColor="gray.200"
                align="center"
              >
                <Tooltip label="Attach file (coming soon)">
                  <IconButton
                    icon={<FiPaperclip />}
                    variant="ghost"
                    aria-label="Attach file"
                    mr="2"
                    isDisabled={true}
                  />
                </Tooltip>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  mr="2"
                />
                <IconButton
                  colorScheme="blue"
                  aria-label="Send message"
                  icon={<FiSend />}
                  onClick={sendMessage}
                  isDisabled={messageInput.trim() === ""}
                />
              </Flex>
            </>
          ) : (
            <Flex
              direction="column"
              justify="center"
              align="center"
              h="full"
              p="4"
            >
              <Avatar size="xl" src="/chat-illustration.png" mb="4" />
              <Heading size="md" mb="2">Welcome to Chat App</Heading>
              <Text textAlign="center" color="gray.500">
                Select a chat to start messaging or create a new chat.
              </Text>
              {isMobileView && (
                <Button
                  mt="4"
                  leftIcon={<FiChevronLeft />}
                  onClick={() => setShowChatList(true)}
                >
                  Show Chats
                </Button>
              )}
            </Flex>
          )}
        </Flex>
      )}
      
      {/* Create Group Chat Modal */}
      <Modal isOpen={isCreateGroupOpen} onClose={onCreateGroupClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                placeholder="Enter group name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Add Members</FormLabel>
              <Input
                placeholder="Search users to add"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                mb="3"
              />
              <Box maxH="200px" overflowY="auto">
                {allUsers
                  .filter(u =>
                    u._id !== user?._id &&
                    u.userName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(u => (
                    <Flex
                      key={u._id}
                      align="center"
                      p="2"
                      borderRadius="md"
                      cursor="pointer"
                      bg={selectedUsers.find(su => su._id === u._id) ? "blue.50" : "white"}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleUserSelect(u)}
                    >
                      <Avatar size="sm" name={u.userName} mr="3" />
                      <Text flex="1">{u.userName}</Text>
                      {selectedUsers.find(su => su._id === u._id) && (
                        <Badge colorScheme="blue">Selected</Badge>
                      )}
                    </Flex>
                  ))}
              </Box>
              {selectedUsers.length > 0 && (
                <Box mt="3">
                  <Text fontWeight="medium" mb="2">
                    {`Selected (${selectedUsers.length}):`}
                  </Text>
                  <Flex flexWrap="wrap" gap="2">
                    {selectedUsers.map(u => (
                      <Badge
                        key={u._id}
                        colorScheme="blue"
                        borderRadius="full"
                        px="2"
                        py="1"
                      >
                        {u.userName}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={createGroupChat}
              isLoading={loading}
              isDisabled={!groupChatName || selectedUsers.length < 2}
            >
              Create Group
            </Button>
            <Button onClick={onCreateGroupClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ChatInterface;