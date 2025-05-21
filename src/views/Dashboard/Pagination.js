import React from "react";
import { Flex, Button, Text } from "@chakra-ui/react";

const Pagination = ({ currentPage, setCurrentPage }) => {
  return (
    <Flex justify="space-between" align="center" mt={4}>
      <Text fontSize="sm">Page {currentPage} of 1</Text>
      <Flex>
        <Button size="sm" variant="outline" mr={2} isDisabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
          Previous
        </Button>
        <Button size="sm" variant="outline" isDisabled>Next</Button>
      </Flex>
    </Flex>
  );
};

export default Pagination;