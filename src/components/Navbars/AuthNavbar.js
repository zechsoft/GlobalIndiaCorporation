import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  Icon,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { FaChartPie, FaUser, FaUserCircle, FaKey } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function AuthNavbar() {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

  // Chakra color mode
  let mainText = useColorModeValue("gray.700", "white");
  let navbarBg = "none";
  let navbarBorder = "none";
  let navbarShadow = useColorModeValue("lg", "none");
  let navbarFilter = "initial";
  let navbarBackdrop = "blur(20px)";
  let navbarPosition = "absolute";
  let hamburgerColor = useColorModeValue("gray.700", "white");

  // Scroll direction state
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Brand component with reduced boldness and smaller font size
  let brand = (
    <Link
      href="/"
      display="flex"
      lineHeight="100%"
      fontWeight="semibold" // Reduced boldness
      justifyContent="center"
      alignItems="center"
      color={mainText}
    >
      <Text fontSize="md" fontWeight="semibold"> {/* Reduced boldness and font size */}
        Argon Dashboard 3
      </Text>
    </Link>
  );

  // Links for desktop and mobile
  const linksAuth = (
    <>
      {/* Desktop Links */}
      <HStack spacing={2} display={{ base: "none", lg: "flex" }}> {/* Reduced gap */}
        <NavLink to="/admin/dashboard">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaChartPie} />}
            color={mainText}
          >
            <Text fontSize="sm" fontWeight="normal">Dashboard</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
        <NavLink to="/admin/profile">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaUser} />}
            color={mainText}
          >
            <Text fontSize="sm" fontWeight="normal">Profile</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
        <NavLink to="/auth/signup">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaUserCircle} />}
            color={mainText}
          >
            <Text fontSize="sm" fontWeight="normal">Sign Up</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
        <NavLink to="/auth/signin">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaKey} />}
            color={mainText}
          >
            <Text fontSize="sm" fontWeight="normal">Sign In</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
      </HStack>

      {/* Mobile Links */}
      <Stack spacing={1} display={{ base: "flex", lg: "none" }}> {/* Reduced gap */}
        <NavLink to="/admin/dashboard">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaChartPie} />}
            color={mainText}
            justifyContent="flex-start"
            w="100%"
          >
            <Text fontSize="sm" fontWeight="normal">Dashboard</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
        <NavLink to="/admin/profile">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaUser} />}
            color={mainText}
            justifyContent="flex-start"
            w="100%"
          >
            <Text fontSize="sm" fontWeight="normal">Profile</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
        <NavLink to="/auth/signup">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaUserCircle} />}
            color={mainText}
            justifyContent="flex-start"
            w="100%"
          >
            <Text fontSize="sm" fontWeight="normal">Sign Up</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
        <NavLink to="/auth/signin">
          <Button
            variant="ghost"
            leftIcon={<Icon as={FaKey} />}
            color={mainText}
            justifyContent="flex-start"
            w="100%"
          >
            <Text fontSize="sm" fontWeight="normal">Sign In</Text> {/* Smaller font size */}
          </Button>
        </NavLink>
      </Stack>
    </>
  );

  return (
    <Box
      position={navbarPosition}
      top={showNavbar ? "16px" : "-100px"}
      left="50%"
      transform="translate(-50%, 0px)"
      bg={navbarBg}
      border={navbarBorder}
      boxShadow={navbarShadow}
      filter={navbarFilter}
      backdropFilter="blur(20px)"
      borderRadius="lg"
      px={4}
      py={2}
      mx={4}
      width="calc(100% - 32px)"
      maxW="1200px"
      zIndex="3"
      transition="top 0.3s ease"
    >
      <Flex w="100%" justifyContent="space-between" alignItems="center">
        {/* Brand */}
        {brand}

        {/* Hamburger Menu (Mobile) */}
        <Box display={{ base: "flex", lg: "none" }}>
          <Button
            onClick={onToggle}
            variant="ghost"
            aria-label="Toggle Navigation"
          >
            <Box w="24px" h="24px">
              <Box
                w="100%"
                h="2px"
                bg={hamburgerColor}
                mb="6px"
                transition="all 0.3s"
                transform={isOpen ? "rotate(45deg) translate(5px, 5px)" : "none"}
              />
              <Box
                w="100%"
                h="2px"
                bg={hamburgerColor}
                mb="6px"
                opacity={isOpen ? 0 : 1}
                transition="all 0.3s"
              />
              <Box
                w="100%"
                h="2px"
                bg={hamburgerColor}
                transition="all 0.3s"
                transform={isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none"}
              />
            </Box>
          </Button>
        </Box>

        {/* Collapsible Mobile Menu */}
        <Collapse in={isOpen} animateOpacity>
          <Box
            display={{ base: "block", lg: "none" }}
            mt={4}
            bg={useColorModeValue("white", "gray.800")}
            borderRadius="md"
            py={2}
            px={4}
            boxShadow="md"
          >
            {linksAuth}
          </Box>
        </Collapse>

        {/* Desktop Links */}
        <Box display={{ base: "none", lg: "block" }}>{linksAuth}</Box>

        {/* Free Download Button (Desktop) */}
        <Button
          display={{ base: "none", lg: "block" }}
          colorScheme="blue"
          size="sm"
          ml={2} 
        >
          <Text fontSize="sm" fontWeight="normal">Free Download</Text> {/* Smaller font size */}
        </Button>
      </Flex>
    </Box>
  );
}