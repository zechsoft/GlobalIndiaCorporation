import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Avatar,
  Divider,
  Heading,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";
import { io } from "socket.io-client";
import axios from "axios";
import { 
  FiSend, 
  FiPlus, 
  FiMoreVertical, 
  FiUsers, 
  FiSearch, 
  FiPaperclip,
  FiUser,
  FiMessageSquare
} from "react-icons/fi";

// Socket.io client connection
const SOCKET_URL = "http://localhost:8000"; // Use your server URL
let socket;

const Chat = () => {
  // State variables
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [notification, setNotification] = useState([]);
  
  // Group chat states
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  
  // Refs
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Chakra UI hooks
  const toast = useToast();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  // Get the current user from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
    if (userData) {
      setCurrentUser(userData);
    } else {
      toast({
        title: "Not logged in",
        description: "Please login to access the chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Socket connection setup
  useEffect(() => {
    if (currentUser) {
      socket = io(SOCKET_URL);
      
      socket.on("connect", () => {
        setSocketConnected(true);
        socket.emit("setup", currentUser);
      });
      
      socket.on("typing", (user) => {
        setIsTyping(true);
        setTypingUser(user.name);
      });
      
      socket.on("stop typing", () => {
        setIsTyping(false);
      });
      
      socket.on("message received", (newMessage) => {
        // If chat is not selected or doesn't match current chat
        if (!activeChat || activeChat._id !== newMessage.chat._id) {
          // Give notification
          if (!notification.includes(newMessage)) {
            setNotification([...notification, newMessage]);
            fetchChats(); // Update chat list to show new message preview
          }
        } else {
          setMessages([...messages, newMessage]);
        }
      });

      // Clean up on component unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser, activeChat, messages, notification]);

  // Fetch all chats for current user
  const fetchChats = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/chat`, {
        withCredentials: true
      });
      setChats(data);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load chats",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users for creating new chats
  const fetchUsers = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/user`, {
        withCredentials: true
      });
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load chats when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchChats();
      fetchUsers();
    }
  }, [currentUser]);

  // Fetch messages for selected chat
  const fetchMessages = async () => {
    if (!activeChat) return;
    
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/message/${activeChat._id}`, {
        withCredentials: true
      });
      setMessages(data);
      
      // Mark messages as read for this chat
      socket.emit("join chat", activeChat._id);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load messages",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages when active chat changes
  useEffect(() => {
    fetchMessages();
    
    // Remove the selected chat from notifications
    const newNotifications = notification.filter(
      (n) => n.chat._id !== activeChat?._id
    );
    setNotification(newNotifications);
  }, [activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (event) => {
    event.preventDefault();
    
    if (messageInput.trim() === "") return;
    
    socket.emit("stop typing", activeChat._id);
    
    try {
      setMessageInput("");
      const { data } = await axios.post(
        "/api/message",
        {
          content: messageInput,
          chatId: activeChat._id,
        },
        { withCredentials: true }
      );
      
      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to send message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle typing
  const typingHandler = (e) => {
    setMessageInput(e.target.value);
    
    if (!socketConnected) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { room: activeChat._id, user: currentUser });
    }
    
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      
      if (timeDiff >= timerLength) {
        socket.emit("stop typing", activeChat._id);
        setIsTyping(false);
      }
    }, timerLength);
  };

  // Create or access one-to-one chat
  const accessChat = async (userId) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        `/api/chat`,
        { userId },
        { withCredentials: true }
      );
      
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      
      setActiveChat(data);
      onDrawerClose();
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create group chat
  const createGroupChat = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toast({
        title: "Please fill all the fields",
        description: "Group name and at least 2 users are required",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        { withCredentials: true }
      );
      
      setChats([data, ...chats]);
      onModalClose();
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle adding user to selected users for group chat
  const handleGroupUserSelect = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((sel) => sel._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Get name and avatar for chat display
  const getSenderInfo = (chat) => {
    if (!chat.isGroupChat) {
      const otherUser = chat.users.find(
        (user) => user._id !== currentUser._id
      );
      return {
        name: otherUser?.userName || "User",
        avatar: otherUser?.profileImage || `https://avatar.oxro.io/avatar.svg?name=${otherUser?.userName}`,
      };
    } else {
      return {
        name: chat.chatName,
        avatar: `https://avatar.oxro.io/avatar.svg?name=${chat.chatName}&background=random`,
      };
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Flex 
      w="100%" 
      h="calc(100vh - 80px)" 
      borderRadius="lg" 
      overflow="hidden"
    >
      {/* Left sidebar with chat list */}
      <Flex
        direction="column"
        w="30%"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Flex p="4" borderBottom="1px solid" borderColor="gray.200" align="center" justify="space-between">
          <Heading size="lg">Chats</Heading>
          <Flex>
            <Tooltip label="New Group Chat" hasArrow>
              <IconButton
                icon={<FiUsers />}
                onClick={onModalOpen}
                mr="2"
                colorScheme="blue"
                variant="ghost"
              />
            </Tooltip>
            <Tooltip label="New Chat" hasArrow>
              <IconButton
                icon={<FiPlus />}
                onClick={onDrawerOpen}
                colorScheme="blue"
              />
            </Tooltip>
          </Flex>
        </Flex>

        {/* Search input */}
        <Box p="3">
          <Flex position="relative" align="center">
            <Input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              pr="8"
            />
            <Box position="absolute" right="3">
              <FiSearch color="gray" />
            </Box>
          </Flex>
        </Box>

        {/* Chat list */}
        <Box overflowY="auto" h="100%" p="2">
          {chats
          .filter(chat => {
            const senderInfo = getSenderInfo(chat);
            return senderInfo.name.toLowerCase().includes(search.toLowerCase());
          })
          .map((chat) => {
            const senderInfo = getSenderInfo(chat);
            const hasNotification = notification.some(n => n.chat._id === chat._id);
            
            return (
              <Flex
                key={chat._id}
                align="center"
                p="3"
                mb="2"
                cursor="pointer"
                bg={activeChat?._id === chat._id ? "blue.50" : "gray.50"}
                borderRadius="lg"
                _hover={{ bg: "blue.50" }}
                onClick={() => setActiveChat(chat)}
                position="relative"
              >
                <Avatar
                  size="md"
                  name={senderInfo.name}
                  src={senderInfo.avatar}
                  mr="3"
                />
                <Box flex="1">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" isTruncated maxW="70%">
                      {senderInfo.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {chat.latestMessage && formatTime(chat.latestMessage.createdAt)}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.600" isTruncated>
                    {chat.latestMessage ? chat.latestMessage.content : "No messages yet"}
                  </Text>
                </Box>
                {hasNotification && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                    position="absolute"
                    top="3"
                    right="3"
                    px="2"
                  >
                    New
                  </Badge>
                )}
                {chat.isGroupChat && (
                  <Badge colorScheme="blue" ml="1" fontSize="xs">
                    Group
                  </Badge>
                )}
              </Flex>
            );
          })}
        </Box>
      </Flex>

      {/* Right side - chat messages */}
      <Flex flex="1" direction="column" bg="gray.50">
        {activeChat ? (
          <>
            {/* Chat header */}
            <Flex
              p="4"
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.200"
              align="center"
              justify="space-between"
            >
              <Flex align="center">
                <Avatar
                  size="md"
                  name={getSenderInfo(activeChat).name}
                  src={getSenderInfo(activeChat).avatar}
                  mr="3"
                />
                <Box>
                  <Text fontWeight="bold">{getSenderInfo(activeChat).name}</Text>
                  {activeChat.isGroupChat && (
                    <Text fontSize="xs" color="gray.500">
                      {activeChat.users.length} members
                    </Text>
                  )}
                </Box>
              </Flex>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                />
                <MenuList>
                  {activeChat.isGroupChat && (
                    <MenuItem>Group Info</MenuItem>
                  )}
                  <MenuItem>Clear Chat</MenuItem>
                  {activeChat.isGroupChat && activeChat.groupAdmin?._id === currentUser?._id && (
                    <MenuItem color="red.500">Delete Group</MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Flex>

            {/* Messages area */}
            <Box
              flex="1"
              overflowY="auto"
              p="4"
              backgroundImage="linear-gradient(to bottom, rgba(247, 250, 252, 0.8), rgba(237, 242, 247, 0.8))"
              backgroundSize="cover"
            >
              {messages.map((message, index) => {
                const isSender = message.sender._id === currentUser._id;
                const showAvatar = index === 0 || 
                  messages[index - 1].sender._id !== message.sender._id;
                
                return (
                  <Flex
                    key={message._id}
                    direction="column"
                    align={isSender ? "flex-end" : "flex-start"}
                    mb="4"
                  >
                    <Flex
                      direction={isSender ? "row-reverse" : "row"}
                      align="flex-end"
                    >
                      {!isSender && showAvatar ? (
                        <Avatar
                          size="sm"
                          name={message.sender.userName}
                          src={message.sender.profileImage}
                          mr={isSender ? 0 : 2}
                          ml={isSender ? 2 : 0}
                        />
                      ) : (
                        <Box w="32px" mr={isSender ? 0 : 2} ml={isSender ? 2 : 0} />
                      )}
                      <Box
                        bg={isSender ? "blue.500" : "white"}
                        color={isSender ? "white" : "black"}
                        px="4"
                        py="2"
                        borderRadius="lg"
                        maxW="70%"
                        boxShadow="sm"
                      >
                        {activeChat.isGroupChat && !isSender && showAvatar && (
                          <Text fontSize="xs" fontWeight="bold" color={isSender ? "blue.100" : "blue.500"}>
                            {message.sender.userName}
                          </Text>
                        )}
                        <Text>{message.content}</Text>
                        <Text fontSize="xs" color={isSender ? "blue.100" : "gray.500"} textAlign="right">
                          {formatTime(message.createdAt)}
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <Flex align="center" mb="4">
                  <Text fontSize="xs" color="gray.500" mr="2">
                    {typingUser} is typing...
                  </Text>
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg="gray.500"
                    mr="1"
                    animation="pulse 1.5s infinite"
                  />
                </Flex>
              )}
              <div ref={messageEndRef} />
            </Box>

            {/* Message input area */}
            <Flex
              p="4"
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              align="center"
            >
              <IconButton
                icon={<FiPaperclip />}
                variant="ghost"
                mr="2"
                isDisabled
                aria-label="Attach file"
              />
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={typingHandler}
                onKeyPress={(e) => e.key === "Enter" && sendMessage(e)}
                mr="2"
              />
              <IconButton
                colorScheme="blue"
                icon={<FiSend />}
                onClick={sendMessage}
                aria-label="Send message"
              />
            </Flex>
          </>
        ) : (
          <Flex
            flex="1"
            justify="center"
            align="center"
            direction="column"
            p="10"
          >
            <FiMessageSquare size="60px" color="#CBD5E0" />
            <Text fontSize="xl" mt="4" color="gray.500">
              Select a chat to start messaging
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Users drawer for starting new chat */}
      <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Create New Chat</DrawerHeader>
          <DrawerBody>
            <Box p="2">
              <Input
                placeholder="Search users..."
                mb="4"
                onChange={(e) => setSearch(e.target.value)}
              />
              <VStack spacing="2" align="stretch">
                {users
                  .filter(user => 
                    user._id !== currentUser._id && 
                    user.userName.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(user => (
                    <Flex
                      key={user._id}
                      align="center"
                      p="2"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => accessChat(user._id)}
                    >
                      <Avatar
                        size="sm"
                        name={user.userName}
                        src={user.profileImage}
                        mr="3"
                      />
                      <Text>{user.userName}</Text>
                    </Flex>
                  ))}
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Modal for creating group chat */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>Group Name</FormLabel>
              <Input
                placeholder="Enter group name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Add Users (at least 2)</FormLabel>
              <Input
                placeholder="Search users..."
                onChange={(e) => setSearch(e.target.value)}
                mb="2"
              />
            </FormControl>
            
            {/* Selected users */}
            <Flex wrap="wrap" mb="4">
              {selectedUsers.map(user => (
                <Badge
                  key={user._id}
                  m="1"
                  p="1"
                  borderRadius="full"
                  colorScheme="blue"
                  cursor="pointer"
                  onClick={() => handleGroupUserSelect(user)}
                >
                  {user.userName} ✕
                </Badge>
              ))}
            </Flex>
            
            {/* User list for selection */}
            <Box maxH="200px" overflowY="auto">
              {users
                .filter(user => 
                  user._id !== currentUser._id && 
                  user.userName.toLowerCase().includes(search.toLowerCase())
                )
                .map(user => (
                  <Flex
                    key={user._id}
                    align="center"
                    p="2"
                    borderRadius="md"
                    cursor="pointer"
                    bg={selectedUsers.some(u => u._id === user._id) ? "blue.100" : ""}
                    _hover={{ bg: "gray.100" }}
                    onClick={() => handleGroupUserSelect(user)}
                  >
                    <Avatar
                      size="sm"
                      name={user.userName}
                      src={user.profileImage}
                      mr="3"
                    />
                    <Text>{user.userName}</Text>
                  </Flex>
                ))}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={createGroupChat}>
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Chat;