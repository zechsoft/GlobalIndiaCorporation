import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  Avatar,
  Icon,
  IconButton,
  HStack,
  VStack,
  Collapse,
  useTheme,
  keyframes,
  useToast
} from "@chakra-ui/react";
import IconBox from "components/Icons/IconBox";
import { HSeparator } from "components/Separator/Separator";
import React, { useContext, useRef, useState, useEffect } from "react";
import { NavLink, useLocation, useHistory } from "react-router-dom";
import { SidebarContext } from "contexts/SidebarContext";
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaSignOutAlt,
  FaChevronRight
} from "react-icons/fa";
import axios from "axios";

// Define the base URL for the backend
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

// Define animations
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

function Sidebar(props) {
  const location = useLocation();
  const [state, setState] = React.useState({});
  const mainPanel = useRef();
  const { colorMode } = useColorMode();
  const { sidebarVariant } = props;
  const history = useHistory();
  const theme = useTheme();
  const toast = useToast();
  
  // Get sidebar state from context
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useContext(SidebarContext);

  // Secondary navbar state
  const [secondaryNavbarOpen, setSecondaryNavbarOpen] = useState(false);
  const [activeSecondaryRoute, setActiveSecondaryRoute] = useState(null);

  // Footer states
  const [showFooter, setShowFooter] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [anyCategoryOpen, setAnyCategoryOpen] = useState(false);

  // Track if item was clicked
  const [navigationClicked, setNavigationClicked] = useState(false);

  // Add click outside event listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarOpen && mainPanel.current && !mainPanel.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  // Auto-hide sidebar after navigation on all screen sizes
  useEffect(() => {
    if (navigationClicked) {
      const timeout = setTimeout(() => {
        setSidebarOpen(false);
        setNavigationClicked(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [navigationClicked, location.pathname, setSidebarOpen]);

  // Track route changes to automatically hide sidebar
  useEffect(() => {
    // This will hide the sidebar whenever the route changes
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  // Handle scroll event to hide footer
  useEffect(() => {
    const sidebarElement = mainPanel.current;
    let scrollTimeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    if (sidebarElement) {
      sidebarElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Check if any category is open
  useEffect(() => {
    const isAnyCategoryOpen = Object.values(state).some(value => value === true);
    setAnyCategoryOpen(isAnyCategoryOpen);
  }, [state]);

  // activeRoute function to check if the current route is active
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };

  const { logo, routes } = props;

  const toggleSecondaryNavbar = (route) => {
    if (activeSecondaryRoute === route.path) {
      setSecondaryNavbarOpen(!secondaryNavbarOpen);
    } else {
      setActiveSecondaryRoute(route.path);
      setSecondaryNavbarOpen(true);
    }
  };

  // Get user data from storage
  const getUserData = () => {
    let storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };
  
  const [userData, setUserData] = useState(getUserData());

  // Fetch user data from backend if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If we have a token but no user data, fetch it from the backend
    if (token && !userData) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.user) {
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUserData(response.data.user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If token is invalid, clear it
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            handleLogout();
          }
        }
      };
      
      fetchUserData();
    }
  }, []);

  // Logout function
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Call the logout endpoint if needed
      if (token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear auth data regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem("user");
      sessionStorage.removeItem('user');
      sessionStorage.removeItem("secret");
      
      // Show toast notification
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Reset user data state
      setUserData(null);
      
      // Redirect to sign-in page
      history.push("/auth/signin");
    }
  };

  const createLinks = (routes) => {
    const activeBg = useColorModeValue("white", "navy.700");
    const inactiveBg = useColorModeValue("white", "navy.700");
    const activeColor = useColorModeValue("gray.700", "white");
    const inactiveColor = useColorModeValue("gray.400", "gray.400");
    const sidebarActiveShadow = "0px 7px 11px rgba(0, 0, 0, 0.04)";
    const hoverColor = useColorModeValue("blue.50", "whiteAlpha.100");

    return routes.map((prop, key) => {
      if (prop.redirect || prop.sidebar === false) return null;

      if (prop.category) {
        const isOpen = state[prop.state];
        const sidebarViews = prop.views.filter(view => view.sidebar !== false);
        if (sidebarViews.length === 0) return null;
        
        return (
          <Box key={key}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              onClick={() => setState({ ...state, [prop.state]: !isOpen })}
              cursor="pointer"
              mb={{ base: "6px", xl: "12px" }}
              mx="auto"
              ps={{ sm: "10px", xl: "16px" }}
              py="12px"
              borderRadius="15px"
              _hover={{
                bg: hoverColor,
                transform: "translateX(5px)",
                transition: "all 0.3s ease"
              }}
              transition="all 0.3s ease"
            >
              <Text color={activeColor} fontWeight="bold">
                {document.documentElement.dir === "rtl" ? prop.rtlName : prop.name}
              </Text>
              <Icon 
                as={isOpen ? FaChevronDown : FaChevronRight} 
                mr="8px" 
                color={activeColor}
                transition="transform 0.3s ease"
              />
            </Flex>
            <Collapse in={isOpen} animateOpacity>
              <Box 
                pl={4}
                borderLeft="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.700")}
                ml={4}
              >
                {createLinks(sidebarViews)}
              </Box>
            </Collapse>
          </Box>
        );
      }

      const isActive = activeRoute(prop.layout + prop.path) === "active";
      const hasSecondaryNavbar = prop.secondaryNavbar === true;
      
      return (
        <Flex key={key} width="100%" position="relative" align="center">
          <NavLink 
            to={prop.layout + prop.path} 
            style={{ width: hasSecondaryNavbar ? '85%' : '100%' }}
            onClick={() => setNavigationClicked(true)}
          >
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              boxShadow={isActive ? sidebarActiveShadow : "none"}
              bg={isActive ? activeBg : "transparent"}
              mb={{ base: "6px", xl: "12px" }}
              mx={{ xl: "auto" }}
              ps={{ sm: "10px", xl: "16px" }}
              py="12px"
              borderRadius="15px"
              w="100%"
              _hover={{
                bg: hoverColor,
                transform: "translateX(5px)",
                transition: "all 0.3s ease"
              }}
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
              transition="all 0.3s ease"
              _after={{
                content: isActive ? '""' : "none",
                position: "absolute",
                top: "4",
                right: "0",
                width: "2px",
                height: "45%",
                backgroundColor: "blue.500",
                borderRadius: "0px 4px 4px 0px",
              }}
              sx={
                isActive ? {
                  animation: `${pulseAnimation} 2s infinite ease-in-out`
                } : {}
              }
            >
              <Flex position="relative">
                {typeof prop.icon === "string" ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox
                    bg={isActive ? "blue.500" : inactiveBg}
                    color={isActive ? "white" : "blue.500"}
                    h="30px"
                    w="30px"
                    me="12px"
                    transition="all 0.3s ease"
                  >
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={isActive ? activeColor : inactiveColor} my="auto" fontSize="sm">
                  {document.documentElement.dir === "rtl" ? prop.rtlName : prop.name}
                </Text>
              </Flex>
            </Button>
          </NavLink>
          
          {hasSecondaryNavbar && (
            <IconButton
              icon={activeSecondaryRoute === prop.path && secondaryNavbarOpen ? 
                <FaChevronDown /> : <FaChevronRight />}
              variant="ghost"
              size="sm"
              position="absolute"
              right="0"
              aria-label="Toggle secondary navbar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSecondaryNavbar(prop);
              }}
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.1)" }}
            />
          )}
        </Flex>
      );
    });
  };

  // Secondary Navbar Component
  const SecondaryNavbar = ({ route }) => {
    if (!route) return null;
    
    const bgColor = useColorModeValue("white", "navy.700");
    const textColor = useColorModeValue("gray.700", "white");
    
    return (
      <Collapse in={secondaryNavbarOpen} animateOpacity>
        <Box
          bg={bgColor}
          borderRadius="15px"
          p={3}
          mt={2}
          mb={4}
          boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
          sx={{
            animation: `${fadeIn} 0.3s ease-in-out`
          }}
        >
          <Text fontWeight="bold" mb={2} color={textColor}>
            {route.name} Details
          </Text>
          <VStack align="stretch" spacing={2}>
            <Button 
              variant="ghost" 
              size="sm" 
              justifyContent="flex-start"
              transition="all 0.3s ease"
              _hover={{ transform: "translateX(5px)", bg: useColorModeValue("blue.50", "whiteAlpha.100") }}
              onClick={() => setNavigationClicked(true)}
            >
              View Details
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              justifyContent="flex-start" 
              transition="all 0.3s ease"
              _hover={{ transform: "translateX(5px)", bg: useColorModeValue("blue.50", "whiteAlpha.100") }}
              onClick={() => setNavigationClicked(true)}
            >
              Edit {route.name}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              justifyContent="flex-start"
              transition="all 0.3s ease"
              _hover={{ transform: "translateX(5px)", bg: useColorModeValue("blue.50", "whiteAlpha.100") }}
              onClick={() => setNavigationClicked(true)}
            >
              Settings
            </Button>
          </VStack>
        </Box>
      </Collapse>
    );
  };

  // User Footer component
  const UserFooter = () => {
    const bgColor = useColorModeValue("white", "navy.800");
    const textColor = useColorModeValue("gray.700", "white");
    
    if (anyCategoryOpen) return null;
    
    return (
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg={bgColor}
        p={4}
        borderTopRadius="15px"
        boxShadow="0 -4px 12px 0 rgba(0, 0, 0, 0.05)"
        transform={showFooter ? "translateY(0)" : "translateY(70%)"}
        transition="transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        opacity={isScrolling ? 0.2 : 1}
        _hover={{ opacity: 1 }}
        zIndex={2}
      >
        <IconButton
          icon={showFooter ? <FaChevronDown /> : <FaChevronUp />}
          variant="ghost"
          position="absolute"
          top="-15px"
          left="50%"
          transform="translateX(-50%)"
          borderRadius="full"
          size="sm"
          onClick={() => setShowFooter(!showFooter)}
          aria-label={showFooter ? "Hide footer" : "Show footer"}
          bg={bgColor}
          boxShadow="0 -4px 12px 0 rgba(0, 0, 0, 0.05)"
          _hover={{ transform: "translateX(-50%) scale(1.1)" }}
          transition="transform 0.3s ease"
        />
        
        <Flex direction="column" align="center">
          <Flex align="center" mb={2}>
            <Avatar 
              size="md" 
              name={userData?.name || "User Name"} 
              src={userData?.avatar ? `${API_BASE_URL}${userData.avatar}` : `${API_BASE_URL}/uploads/default-avatar.png`} 
              mr={3}
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.1)", cursor: "pointer" }}
            />
            <VStack spacing={0} align="start">
              <Text fontWeight="bold" fontSize="sm" color={textColor}>
                {userData?.name || "User Name"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {userData?.email || "user@example.com"}
              </Text>
            </VStack>
          </Flex>
          
          <HSeparator my={2} />
          
          <HStack spacing={4} my={2}>
            <IconButton
              aria-label="Facebook"
              icon={<FaFacebook />}
              variant="ghost"
              colorScheme="blue"
              size="sm"
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.2)" }}
            />
            <IconButton
              aria-label="Twitter"
              icon={<FaTwitter />}
              variant="ghost"
              colorScheme="blue"
              size="sm"
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.2)" }}
            />
            <IconButton
              aria-label="Instagram"
              icon={<FaInstagram />}
              variant="ghost"
              colorScheme="blue"
              size="sm"
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.2)" }}
            />
          </HStack>
          
          <Button
            leftIcon={<FaSignOutAlt />}
            variant="outline"
            size="sm"
            width="100%"
            mt={2}
            onClick={handleLogout}
            colorScheme="blue"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          >
            Logout
          </Button>
        </Flex>
      </Box>
    );
  };

  // Filter routes that should appear in sidebar
  const sidebarRoutes = routes.filter(route => route.sidebar !== false);
  var links = <>{createLinks(sidebarRoutes)}</>;

  // Find active route with secondaryNavbar flag
  const activeRouteWithSecondary = routes.find(route => 
    route.secondaryNavbar && 
    route.path && 
    activeRoute(route.layout + route.path) === "active"
  );

  // If there's an active route with secondaryNavbar, set it as active
  useEffect(() => {
    if (activeRouteWithSecondary) {
      setActiveSecondaryRoute(activeRouteWithSecondary.path);
      setSecondaryNavbarOpen(true);
    }
  }, [location.pathname, activeRouteWithSecondary]);

  let sidebarBg = useColorModeValue("white", "navy.800");
  let sidebarRadius = "20px";

  // Define the brand (logo or header section)
  const brand = (
    <Box pt={"25px"} mb="12px" transition="all 0.3s ease">
      {logo}
      <HSeparator my="26px" />
    </Box>
  );

  // Calculate bottom padding based on secondary navbar and category state
  const contentBottomPadding = anyCategoryOpen ? "20px" : (secondaryNavbarOpen ? "150px" : "80px");

  // Animation styles based on sidebar state
  const sidebarAnimation = sidebarOpen 
    ? `${slideIn} 0.3s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)` 
    : `${slideOut} 0.3s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)`;

  return (
    <Box ref={mainPanel}>
      {/* Unified Sidebar for all screen sizes */}
      <Box
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        w={{ base: "100%", md: "300px" }}
        maxW={{ base: "100%", md: "300px" }}
        bg={sidebarBg}
        borderRadius={{ base: "0", md: sidebarRadius }}
        zIndex="10"
        p="20px"
        boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
        overflowY="auto"
        transform={sidebarOpen ? "translateX(0)" : "translateX(-100%)"}
        animation={sidebarAnimation}
        sx={{
          scrollbarWidth: isScrolling ? "none" : "auto",
          "&::-webkit-scrollbar": {
            width: isScrolling ? "0px" : "6px",
            transition: "width 0.3s ease"
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "10px",
          }
        }}
      >
        <Box>
          {brand}
          <Stack direction="column" mb={contentBottomPadding}>
            <Box>{links}</Box>
            
            {/* Secondary Navbar */}
            {activeSecondaryRoute && !anyCategoryOpen && (
              <SecondaryNavbar route={routes.find(r => r.path === activeSecondaryRoute)} />
            )}
          </Stack>
          
          {/* User profile footer */}
          <UserFooter />
        </Box>
      </Box>

      {/* Overlay to close sidebar on click outside */}
      {sidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100%"
          h="100vh"
          bg="rgba(0,0,0,0.5)"
          zIndex="5"
          onClick={() => setSidebarOpen(false)}
          sx={{
            animation: `${fadeIn} 0.3s ease-in-out`
          }}
          backdropFilter="blur(3px)"
        />
      )}
    </Box>
  );
}

export default Sidebar;