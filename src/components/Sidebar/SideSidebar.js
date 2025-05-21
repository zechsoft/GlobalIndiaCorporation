import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Button, Flex, IconButton } from "@chakra-ui/react"; // Chakra UI components
import { HomeIcon, PersonIcon, StatsIcon, DocumentIcon } from "components/Icons/Icons"; // Icons (ensure you import the correct ones)

const SideSidebar = () => {
  // State to track the sidebar expansion
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  // Create links using the routes
  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) return null; // Skip redirects

      const isActive = window.location.pathname === prop.layout + prop.path; // Check if route is active

      return (
        <NavLink to={prop.layout + prop.path} key={key}>
          <Button
            boxSize="initial"
            justifyContent="center"
            alignItems="center"
            bg={isActive ? "blue.500" : "transparent"}
            boxShadow={isActive ? "0px 7px 11px rgba(0, 0, 0, 0.04)" : "none"}
            mb="6px"
            mx="auto"
            ps="10px"
            py="12px"
            borderRadius="15px"
            w="100%"
            _hover="none"
            _active={{ bg: "inherit", transform: "none", borderColor: "transparent" }}
            _focus={{ boxShadow: "none" }}
          >
            <Flex position="relative">
              <Box
                bg={isActive ? "blue.500" : "transparent"}
                color={isActive ? "white" : "blue.500"}
                h="30px"
                w="30px"
                me="12px"
                display={isSidebarExpanded ? "block" : "none"} // Show icons only when expanded
              >
                {prop.icon}
              </Box>
            </Flex>
          </Button>
        </NavLink>
      );
    });
  };

  return (
    <Box
      position="fixed"
      left={0}
      top="0"
      height="100%"
      width={isSidebarExpanded ? "200px" : "60px"}  // Adjust width
      bg={isSidebarExpanded ? "blue.800" : "blue.500"} // Background color changes based on expansion
      transition="width 0.3s ease" // Smooth transition for width
      zIndex="100"
    >
      {/* Toggle Button */}
      <IconButton
        icon={isSidebarExpanded ? "<" : ">"} // Change button icon on toggle
        onClick={toggleSidebar}
        position="absolute"
        left={isSidebarExpanded ? "200px" : "60px"}
        top="50%"
        transform="translateY(-50%)"
        bg="blue.500"
        _hover={{ bg: "blue.600" }}
        size="lg"
        zIndex="10"
      />

      {/* Render links from the routes */}
      <Box mt="40px">{createLinks(dashRoutes)}</Box>
    </Box>
  );
};

export default SideSidebar;
