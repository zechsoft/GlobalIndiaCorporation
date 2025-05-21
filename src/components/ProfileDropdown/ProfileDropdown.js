import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { ProfileIcon } from "components/Icons/Icons";
import { useHistory } from "react-router-dom";

const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const ProfileDropdown = () => {
  const history = useHistory();
  const toast = useToast();
  const menuRef = useRef();
  const blueShade = useColorModeValue("#0072ff", "#0072ff");
  const bgDropdown = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.700", "white");
  
  // Get user data from localStorage or sessionStorage
  const getUserData = () => {
    var storedUser = localStorage.getItem("user");

    if(!storedUser) {
      storedUser = sessionStorage.getItem("user");
    }
    return storedUser ? JSON.parse(storedUser) : null;
  };
  
  const [userData, setUserData] = useState(getUserData());
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const user = getUserData();
        if (!user || !user.token) {
          return;
        }

        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Token is invalid or expired
          handleLogout(false);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const handleLogout = async (showNotification = true) => {
    try {
      setIsLoading(true);
      const user = getUserData();
      
      if (user && user.token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear storage regardless of API success
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      
      // Show toast notification
      if (showNotification) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Redirect to login page
      history.push("/auth/signin");
      setIsLoading(false);
    }
  };

  // Handle cases where user data doesn't exist
  if (!userData) {
    return null; // Or a login button
  }

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="ghost"
        rightIcon={<FiChevronDown />}
        _hover={{ bg: "transparent" }}
        color="#fff"
        p="0px"
        isLoading={isLoading}
      >
        <Flex alignItems="center">
          <ProfileIcon
            width="25px"
            height="25px"
            color="white"
            mr="2"
          />
          <Text 
            display={{ base: "none", md: "flex" }} 
            color="#fff"
            fontWeight="medium"
          >
            {userData.name || userData.username || "Profile"}
          </Text>
        </Flex>
      </MenuButton>
      
      <MenuList
        bg={bgDropdown}
        borderColor="transparent"
        borderRadius="20px"
        boxShadow="lg"
        p="4"
        minW="250px"
        ref={menuRef}
      >
        <Flex direction="column" p="2">
          <Text fontWeight="bold" fontSize="lg" mb="1">
            User Profile
          </Text>
          <Text color="gray.500" fontSize="sm" mb="3">
            {userData?.email || "mail@example.com"}
          </Text>
          
          <Flex bg="blue.50" p="3" borderRadius="lg" mb="3">
            <Flex
              bg={blueShade}
              color="white"
              borderRadius="md"
              w="10"
              h="10"
              align="center"
              justify="center"
              mr="3"
            >
              <FiUser size={18} />
            </Flex>
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                {userData?.role === "admin" ? "Administrator" : "Client"}
              </Text>
              <Text color="gray.500" fontSize="xs">
                {userData?.role === "admin" ? "Full Access" : "Limited Access"}
              </Text>
            </Box>
          </Flex>
        </Flex>
        
        <Divider mb="3" />
        
        <MenuItem 
          icon={<FiUser color={blueShade} />}
          _hover={{ bg: "blue.50" }}
          borderRadius="md"
          mb="1"
          onClick={() => history.push("/admin/profile")}
        >
          My Profile
        </MenuItem>
        
        <MenuItem 
          icon={<FiSettings color={blueShade} />}
          _hover={{ bg: "blue.50" }}
          borderRadius="md"
          mb="1"
          onClick={() => history.push("/admin/settings")}
        >
          Account Settings
        </MenuItem>
        
        <Divider my="3" />
        
        <MenuItem
          icon={<FiLogOut color={blueShade} />}
          _hover={{ bg: "blue.50" }}
          borderRadius="md"
          onClick={() => handleLogout()}
          isDisabled={isLoading}
        >
          <Text color={blueShade} fontWeight="medium">Log Out</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileDropdown;