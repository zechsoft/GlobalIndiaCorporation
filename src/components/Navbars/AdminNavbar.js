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
  const toast = useToast();
  const API_URL = "https://globalindiabackendnew.onrender.com";

  useEffect(() => {
    const handleScroll = () => changeNavbar();
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
          />
        </Box>
      </Flex>
    </Flex>
  );
}