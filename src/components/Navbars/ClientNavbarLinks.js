import React, { useState, useContext, useEffect } from "react";
import { BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Avatar,
  useBreakpointValue,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import routes from "clientroutes"; // Ensure this is the correct path for client routes
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import { ArgonLogoDark, ArgonLogoLight, ProfileIcon, SettingsIcon } from "components/Icons/Icons";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import ProfileDropdown from "components/ProfileDropdown/ProfileDropdown";
import { SidebarContext } from "contexts/SidebarContext";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

export default function ClientNavbarLinks(props) {
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    ...rest
  } = props;

  const { colorMode } = useColorMode();
  const { toggleSidebar } = useContext(SidebarContext);
  const toast = useToast();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      fetchNotifications(token);
    }
  }, []);

  const fetchNotifications = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setEmail("");
    setPassword("");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user: userData } = response.data;
      
      // Save auth data to local storage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));
      
      setUser(userData);
      setIsLoggedIn(true);
      
      // Fetch notifications after login
      fetchNotifications(token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name || userData.email}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      closeLoginModal();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsLoggedIn(false);
    setNotifications([]);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const navbarIcon = "white";
  const menuBg = "white";

  // This is used to determine when to show the hamburger icon
  const showHamburger = useBreakpointValue({ base: true, lg: true });

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
    >
      <SearchBar me="18px" />

      {/* Notifications Menu */}
      <Menu>
        <MenuButton
          p="0px"
          borderRadius="50%"
          _hover={{ bg: "transparent" }}
          bg="transparent"
          me={{ base: "0px", md: "16px" }}
        >
          <Box position="relative">
            <BellIcon color={navbarIcon} h="25px" w="25px" />
            {isLoggedIn && notifications.length > 0 && (
              <Box
                position="absolute"
                top="-5px"
                right="-5px"
                bg="red.500"
                borderRadius="full"
                w="15px"
                h="15px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xs" color="white">
                  {notifications.length}
                </Text>
              </Box>
            )}
          </Box>
        </MenuButton>
        <MenuList
          bg={menuBg}
          p="16px"
          borderRadius="20px"
          minW="250px"
          mt="15px"
        >
          {isLoggedIn ? (
            notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <MenuItem
                  key={index}
                  borderRadius="8px"
                  mb="10px"
                  _hover={{ bg: "gray.100" }}
                >
                  <Flex direction="column">
                    <Text fontWeight="bold">{notification.title}</Text>
                    <Text fontSize="sm">{notification.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Text>
                  </Flex>
                </MenuItem>
              ))
            ) : (
              <Text p="10px" textAlign="center">
                No new notifications
              </Text>
            )
          ) : (
            <Text p="10px" textAlign="center">
              Please log in to view notifications
            </Text>
          )}
        </MenuList>
      </Menu>

      {/* Profile Section */}
      <Menu>
        {isLoggedIn ? (
          <MenuButton p="0px">
            <Avatar
              size="sm"
              src={user?.avatar || avatar1}
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.05)" }}
            />
          </MenuButton>
        ) : (
          <Button
            onClick={openLoginModal}
            variant="outline"
            colorScheme="blue"
            size="sm"
            mr="16px"
          >
            Login
          </Button>
        )}
        
        {isLoggedIn && (
          <MenuList
            bg={menuBg}
            p="16px"
            borderRadius="20px"
            minW="200px"
            mt="15px"
          >
            <Flex direction="column" p="10px">
              <Text fontWeight="bold">{user?.name || user?.email}</Text>
              <Text fontSize="sm" color="gray.500" mb="10px">
                {user?.role || "Client"}
              </Text>
            </Flex>
            <MenuItem
              borderRadius="8px"
              _hover={{ bg: "gray.100" }}
              icon={<ProfileIcon color="black" h="16px" w="16px" />}
            >
              <Text>Profile</Text>
            </MenuItem>
            <MenuItem
              borderRadius="8px"
              _hover={{ bg: "gray.100" }}
              icon={<SettingsIcon color="black" h="16px" w="16px" />}
            >
              <Text>Settings</Text>
            </MenuItem>
            <MenuItem
              borderRadius="8px"
              _hover={{ bg: "gray.100" }}
              onClick={handleLogout}
            >
              <Text>Logout</Text>
            </MenuItem>
          </MenuList>
        )}
      </Menu>

      <Box ml="auto" display="flex" alignItems="center">
        {/* Show hamburger menu button on all screen sizes for unified approach */}
        {showHamburger && (
          <Button
            onClick={toggleSidebar}
            variant="no-hover"
            ref={props.btnRef}
            p="0px"
            borderRadius="50%"
            mr={{ base: "16px", lg: "15px" }}
            bg="white"
            _hover={{ bg: "white" }}
            boxShadow="0px 0px 5px rgba(0, 0, 0, 0.1)"
            ml="10px"
            aria-label="Toggle Sidebar"
          >
            <HamburgerIcon w="25px" h="25px" color="black" />
          </Button>
        )}
      </Box>

      <SettingsIcon
        cursor="pointer"
        ms={{ base: "16px", xl: "0px" }}
        me="13px"
        onClick={props.onOpen}
        color={navbarIcon}
        w="30px"
        h="30px"
      />

      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="email">
              <FormLabel>Email Address</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl id="password" mt="4">
              <FormLabel>Password</FormLabel>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              onClick={handleLogin} 
              isLoading={isLoading}
              loadingText="Logging in"
            >
              Log In
            </Button>
            <Button variant="ghost" onClick={closeLoginModal} ml={3}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}