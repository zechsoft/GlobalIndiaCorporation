import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  useColorModeValue,
  Input,
  Button,
  IconButton,
  useToast,
  Badge
} from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import AdminNavbarLinks from "./AdminNavbarLinks";
import axios from "axios";

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const toast = useToast();
  const API_URL = "https://globalindiabackendnew.onrender.com";

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);
    
    // Test connection to backend on component mount
    testBackendConnection();
    
    return () => {
      window.removeEventListener("scroll", changeNavbar);
    };
  }, []);

  const testBackendConnection = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 8000; // 8 seconds for Render services
    
    setConnectionAttempts(retryCount + 1);
    
    try {
      console.log(`Testing backend connection... Attempt ${retryCount + 1}/${maxRetries + 1}`);
      setBackendStatus('connecting');
      
      // Try the root URL first - most likely to respond
      const response = await axios.get(API_URL, { 
        timeout: 30000, // 30 second timeout for sleeping services
        validateStatus: function (status) {
          // Accept any response that indicates the server is alive
          return status < 500;
        }
      });
      
      console.log(`Backend responded with status: ${response.status}`);
      
      // If we get any response, the service is alive
      setBackendStatus('online');
      
      if (retryCount === 0) {
        toast({
          title: "Backend Connected",
          description: "Successfully connected to backend service",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      console.error(`Connection attempt ${retryCount + 1} failed:`, error.message);
      
      if (error.code === 'ECONNABORTED') {
        console.log("Connection timeout - backend service might be sleeping");
      }
      
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds... (${maxRetries - retryCount} attempts remaining)`);
        setBackendStatus('retrying');
        
        setTimeout(() => {
          testBackendConnection(retryCount + 1);
        }, retryDelay);
      } else {
        setBackendStatus('offline');
        toast({
          title: "Backend Offline",
          description: "Could not connect to backend service. Some features may be limited.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const {
    variant,
    children,
    fixed,
    secondary,
    brandText,
    onOpen,
    ...rest
  } = props;

  let mainText = "white";
  let navbarPosition = "absolute";
  let navbarHeight = "75px";
  let navbarShadow = "none";
  let navbarBg = "none";
  let navbarBorder = "transparent";
  let secondaryMargin = "0px";
  let paddingX = "15px";
  let navbarWidth = "calc(100vw - 30px)";
  let navbarMargin = "0px";

  if (props.fixed === true) {
    if (scrolled === true) {
      navbarPosition = "fixed";
      navbarHeight = "45px";
      navbarShadow = useColorModeValue(
        "0px 7px 23px rgba(255, 253, 253, 0.05)",
        "none"
      );
      navbarBg = "linear-gradient(to right, #00c6ff, #0072ff)";
      navbarWidth = "calc(100vw - 50px - 275px)";
      navbarMargin = "7px 170px";
      mainText = "white";
    }
  }

  if (props.secondary) {
    navbarBg = "transparent";
    navbarPosition = "absolute";
    mainText = "white";
    secondaryMargin = "22px";
    paddingX = "30px";
  }

  const changeNavbar = () => {
    setScrolled(window.scrollY > 1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query is empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (backendStatus !== 'online') {
      toast({
        title: "Backend unavailable",
        description: `Cannot perform search - backend is ${backendStatus}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Try different possible search endpoints
      const searchEndpoints = [
        '/api/search',
        '/search',
        '/api/v1/search'
      ];
      
      let searchResponse = null;
      for (const endpoint of searchEndpoints) {
        try {
          searchResponse = await axios.get(`${API_URL}${endpoint}`, {
            params: { query: searchQuery },
            timeout: 10000
          });
          break;
        } catch (error) {
          if (error.response?.status !== 404) {
            throw error; // Re-throw non-404 errors
          }
          continue;
        }
      }
      
      if (!searchResponse) {
        throw new Error("Search endpoint not found");
      }
      
      // Handle the search results
      console.log("Search results:", searchResponse.data);
      
      toast({
        title: "Search completed",
        description: `Found ${searchResponse.data.length || 0} results`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.response?.data?.message || error.message || "Could not perform search",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return 'green';
      case 'offline': return 'red';
      case 'connecting': 
      case 'retrying': 
      case 'checking': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'connecting': return 'Connecting...';
      case 'retrying': return `Retrying... (${connectionAttempts}/4)`;
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <Flex
      position={navbarPosition}
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={navbarBorder}
      borderWidth="1px"
      borderStyle="solid"
      transition="all 0.3s ease"
      alignItems="center"
      borderRadius="27px"
      display="flex"
      minH={navbarHeight}
      justifyContent="center"
      lineHeight="25.6px"
      mx="auto"
      mt={secondaryMargin}
      pb={scrolled ? "2px" : "6px"}
      px={{ sm: paddingX, md: "0px" }}
      pt={scrolled ? "2px" : "6px"}
      top="8px"
      w={navbarWidth}
      margin={navbarMargin}
    >
      <Flex
        w="90%"
        flexDirection={{ sm: "column", md: "row" }}
        alignItems="center"
      >
        <Box mb={{ sm: "8px", md: "0px" }}>
          <Breadcrumb fontSize="lg" fontWeight="bold">
            {/* Add breadcrumb items if needed */}
          </Breadcrumb>
          <Flex alignItems="center" gap={2}>
            <Link
              color={mainText}
              href="#"
              bg="inherit"
              borderRadius="inherit"
              fontWeight="bold"
              fontSize="xl"
              _hover={{ color: "white", transform: "scale(1.1)" }}
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{ boxShadow: "none" }}
            >
              {brandText}
            </Link>
            <Badge 
              colorScheme={getStatusColor()} 
              size="sm" 
              fontSize="xs"
              title={`Backend status: ${getStatusText()}`}
            >
              {getStatusText()}
            </Badge>
          </Flex>
        </Box>

        <Box ms="auto" w={{ sm: "100%", md: "unset" }}>
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
            fontSize="lg"
            fontWeight="bold"
            apiUrl={API_URL}
            backendStatus={backendStatus}
          />
        </Box>
      </Flex>
    </Flex>
  );
}