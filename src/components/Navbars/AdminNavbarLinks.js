import React, { useState, useContext } from "react";
import { BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Menu,
  useColorMode,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ProfileIcon, SettingsIcon } from "components/Icons/Icons";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarContext } from "contexts/SidebarContext";
import ProfileDropdown from "components/ProfileDropdown/ProfileDropdown"; // Import ProfileDropdown component

export default function HeaderLinks(props) {
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
  const history = useHistory();

  const navbarIcon = "white";
  
  // This is used to determine when to show the hamburger icon
  const showHamburger = useBreakpointValue({ base: true, lg: true });

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row">
      <SearchBar me="18px" />

      <Menu>
        <ProfileDropdown />
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
        aria-label="Settings"
      />
    </Flex>
  );
}