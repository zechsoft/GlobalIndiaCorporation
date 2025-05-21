import React from "react";
import { useHistory } from "react-router-dom";
import { Button, useToast } from "@chakra-ui/react";
import { LogOutIcon } from "components/Icons/Icons"; // Add this icon to your Icons.js file

const LogoutButton = () => {
  const history = useHistory();
  const toast = useToast();

  const handleLogout = () => {
    // Remove user data from storage
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("secret");
    
    // Show success message
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    // Redirect to sign in page
    history.push("/auth/signin");
  };

  return (
    <Button
      boxSize="initial"
      justifyContent="flex-start"
      alignItems="center"
      bg="transparent"
      mb={{ base: "6px", xl: "12px" }}
      mx={{ xl: "auto" }}
      ps={{ sm: "10px", xl: "16px" }}
      py="12px"
      borderRadius="15px"
      w="100%"
      _hover={{ bg: "gray.100" }}
      _active={{
        bg: "inherit",
        transform: "none",
        borderColor: "transparent",
      }}
      _focus={{
        boxShadow: "none",
      }}
      onClick={handleLogout}
    >
      <LogOutIcon color="blue.500" h="16px" w="16px" me="8px" />
      <span>Logout</span>
    </Button>
  );
};

export default LogoutButton;