import React, { useState, useEffect } from "react";
import { Portal, useDisclosure, Stack, Box, useColorMode } from "@chakra-ui/react";
import Configurator from "components/Configurator/Configurator";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";
// Layout components
import ClientNavbar from "components/Navbars/ClientNavbar.js"; // Import ClientNavbar instead of AdminNavbar
import Sidebar from "components/Sidebar/Sidebar.js";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "clientroutes.js"; // Use client-specific routes
// Custom Chakra theme
import FixedPlugin from "../components/FixedPlugin/FixedPlugin";
import ShiprocketChatbot from "../components/FixedPlugin/ShiprocketChatbot";
import IconSidebar from "components/FixedPlugin/IconSidebar";
import "../components/FixedPlugin/Chatbot.css";
// Custom components
import MainPanel from "../components/Layout/MainPanel";
import PanelContainer from "../components/Layout/PanelContainer";
import PanelContent from "../components/Layout/PanelContent";
import bgAdmin from "assets/img/admin-background.png";
// Import SidebarProvider
import { SidebarProvider } from "contexts/SidebarContext";

export default function Client(props) {
  const { ...rest } = props;
  const [fixed, setFixed] = useState(false);
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Add this useEffect to ensure proper scrolling after initial render
  useEffect(() => {
    // Force the body to be scrollable
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    
    // Reset scroll position on component mount
    window.scrollTo(0, 0);
    
    // Allow a slight delay for any other React rendering to complete
    const timer = setTimeout(() => {
      // Force a reflow to ensure scrolling is enabled
      document.body.style.display = "block";
      setTimeout(() => {
        document.body.style.display = "";
      }, 0);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Functions for getting active route and navbar
  const getRoute = () => {
    return window.location.pathname !== "/client/full-screen-maps"; // Update path for client
  };

  const getActiveRoute = (routes) => {
    let activeRoute = "Client Dashboard"; // Update title for client
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar;
          }
        }
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.category === "account") {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/client") { // Update layout path for client
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";

  return (
    // Wrap the entire component with SidebarProvider
    <SidebarProvider>
      <Box position="relative" height="100%" overflowY="auto">
        <Box
          minH="40vh"
          w="100%"
          position="absolute"
          bgImage={colorMode === "light" ? bgAdmin : "none"}
          bg={colorMode === "light" ? bgAdmin : "navy.900"}
          bgSize="cover"
          top="0"
        />
        {/* Sidebar component now uses context */}
        <Sidebar
          routes={routes}
          logo={
            <Stack direction="row" spacing="12px" align="center" justify="center">
              {colorMode === "dark" ? (
                <ArgonLogoLight w="74px" h="27px" />
              ) : (
                <ArgonLogoDark w="74px" h="27px" />
              )}
              <Box w="1px" h="20px" bg={colorMode === "dark" ? "white" : "gray.700"} />
              {colorMode === "dark" ? (
                <ChakraLogoLight w="82px" h="21px" />
              ) : (
                <ChakraLogoDark w="82px" h="21px" />
              )}
            </Stack>
          }
          display="block"
          {...rest}
        />
        <MainPanel w="100%" overflowY="auto">
          <Portal>
            <ClientNavbar // Use ClientNavbar instead of AdminNavbar
              onOpen={onOpen}
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
              fixed={fixed}
              {...rest}
            />
          </Portal>
          {getRoute() ? (
            <PanelContent>
              <PanelContainer>
                <Switch>
                  {getRoutes(routes)}
                  <Redirect from="/client" to="/client/dashboard" /> {/* Update redirect path for client */}
                </Switch>
              </PanelContainer>
            </PanelContent>
          ) : null}
          <Portal>
            <FixedPlugin
              secondary={getActiveNavbar(routes)}
              fixed={fixed}
              onOpen={onOpen}
            />
          </Portal>

          <Configurator
            secondary={getActiveNavbar(routes)}
            isOpen={isOpen}
            onClose={onClose}
            isChecked={fixed}
            onSwitch={(value) => setFixed(value)}
          />
          <Box position="fixed" bottom="78%" right="0px" transform="translateY(50%)" zIndex="9999">
            <IconSidebar basePath="/client" />
          </Box>

          <Box position="fixed" bottom="20px" left="20px" zIndex="9999">
            <ShiprocketChatbot />
          </Box>
        </MainPanel>
      </Box>
    </SidebarProvider>
  );
}