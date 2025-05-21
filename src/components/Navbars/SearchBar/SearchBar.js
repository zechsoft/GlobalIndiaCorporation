import React, { useState } from "react";
import { Box, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export function SearchBar(props) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      position="relative"
      m="auto"
      w="200px"
      h="60px"
      {...props}
    >
      <Input
        position="absolute"
        m="auto"
        top="0"
        right="0"
        bottom="0"
        left="0"
        w={isFocused ? "200px" : "40px"}
        h="40px"
        outline="none"
        border="none"
        bg="white"
        color="gray.800"
        px="20px"
        borderRadius="30px"
        boxShadow="md"
        transition="all 0.8s"
        opacity={isFocused ? 1 : 0}
        fontWeight="bold"
        letterSpacing="0.1em"
        placeholder="Search.."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {!isFocused && (
        <Box
          position="absolute"
          m="auto"
          top="0"
          right="0"
          bottom="0"
          w="40px"
          h="40px"
          bg="white"
          borderRadius="full"
          transition="all 0.8s"
          zIndex="4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setIsFocused(true)}
          cursor="pointer"
        >
          <SearchIcon color="gray.800" w="16px" h="16px" />
        </Box>
      )}
    </Box>
  );
}
