import React, { useRef, useState } from "react";
import { Input, Select, Button, InputGroup, InputLeftElement, FormControl, FormLabel, Flex } from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchFilter = ({ searchTerm, setSearchTerm, country, setCountry, handleSearch, handleClear }) => {
  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Flex>
      <Select value={country} onChange={(e) => setCountry(e.target.value)} placeholder="" width={40} mr={4}>
        <option value="All">All</option>
        {/* Add other options dynamically based on the context */}
      </Select>
      <FormControl width="half" mr={4}>
        <FormLabel
          position="absolute"
          top={isFocused || searchTerm ? "-16px" : "12px"}
          left="40px"
          color="gray.500"
          fontSize={isFocused || searchTerm ? "xs" : "sm"}
          transition="all 0.2s ease"
          pointerEvents="none"
          opacity={isFocused || searchTerm ? 0 : 1}
        >
          Search here
        </FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <MagnifyingGlassIcon style={{ height: "25px", width: "20px", padding: "2.5px" }} />
          </InputLeftElement>
          <Input
            ref={searchInputRef}
            size="md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            borderColor={isFocused ? "green.500" : "gray.300"}
            _focus={{ borderColor: "green.500", boxShadow: "0 0 0 1px green.500" }}
          />
        </InputGroup>
      </FormControl>
      <Button colorScheme="blue" mr={4} onClick={handleSearch}>Search</Button>
      <Button variant="outline" onClick={handleClear}>Clear</Button>
    </Flex>
  );
};

export default SearchFilter;