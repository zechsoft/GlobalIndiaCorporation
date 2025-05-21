import {
  Flex,
  Text,
  useColorModeValue,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Input,
  HStack
} from "@chakra-ui/react";
import { ChevronDownIcon } from '@chakra-ui/icons'; // For the dropdown icon
import React, { useState } from "react";
import { tablesTableData } from "variables/general"; // Removed tablesProjectData since Projects Table is removed

// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import SupplierInformationTable from "./SupplierInformationTable"; // Import the Supplier Information Table
import CustomerOrderTable from "./CustomerOrderTable"; // Import the Customer Order Table
import MaterialInquiryTable from "./MaterialInquiryTable"; // Import the Material Inquiry Table
import MaterialReplenishTable from "./MaterialReplenishTable"; // Import the Material Replenish Table
import CustomerDeliveryTable from "./CustomerDeliveryTable"; // Import the Customer Delivery Table
import DailyWorkerReportTable from "./DailyWorkerReportTable"; // Import the Daily Worker Report Table

function Tables() {
  const [currentTable, setCurrentTable] = useState('Supplier Information'); // State to control the visible table
  const [searchQuery, setSearchQuery] = useState(''); // State to control the search input
  const [currentPage, setCurrentPage] = useState(1); // State to control the current page

  const rowsPerPage = 5;
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Filtered data based on search query
  const filteredTableData = tablesTableData.filter(row =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.customerNumber.toString().includes(searchQuery)
  );

  // Calculate the indices for the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = filteredTableData.slice(indexOfFirstRow, indexOfLastRow); // Get current page rows

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
        <CardHeader p="6px 0px 22px 0px" display="flex" justifyContent="space-between" alignItems="center">
          {/* Left Side: Dropdown Menu for table selection */}
          <HStack spacing={5}>
            <Menu>
              <MenuButton as={IconButton} icon={<ChevronDownIcon />} variant="outline" />
              <MenuList>
                <MenuItem onClick={() => setCurrentTable('Supplier Information')}>Supplier Information</MenuItem>
                <MenuItem onClick={() => setCurrentTable('Customer Order')}>Customer Order</MenuItem>
                <MenuItem onClick={() => setCurrentTable('Material Inquiry')}>Material Inquiry</MenuItem>
                <MenuItem onClick={() => setCurrentTable('Material Replenish')}>Material Replenish</MenuItem>
                <MenuItem onClick={() => setCurrentTable('Customer Delivery')}>Customer Delivery</MenuItem>
                <MenuItem onClick={() => setCurrentTable('Daily Worker Report')}>Daily Worker Report</MenuItem>
              </MenuList>
            </Menu>
            {/* Table Name placed 2px to the right of the dropdown */}
            <Text fontSize="xl" color={textColor} fontWeight="bold" ml={7}>
              {currentTable}
            </Text>
          </HStack>

          {/* Right Side: Search Bar and Buttons */}
          <HStack spacing={4} ml="auto">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              size={"md"}
              width="auto"
              height={8}
            />
            <Button colorScheme="blue" size="sm" height={9} width={20} onClick={handleClearSearch}>Clear</Button>
            <Button colorScheme="gray" size="sm" height={9} onClick={() => alert("Add New clicked!")}>Add New</Button>
          </HStack>
        </CardHeader>

        {/* Table Body */}
        <CardBody>
          <div style={{ overflowX: 'auto', position: 'relative' }}>
            {currentTable === 'Supplier Information' ? (
              <SupplierInformationTable
                currentRows={currentRows}
                textColor={textColor}
                borderColor={borderColor}
              />
            ) : currentTable === 'Customer Order' ? (
              <CustomerOrderTable
                currentRows={currentRows}
                textColor={textColor}
                borderColor={borderColor}
              />
            ) : currentTable === 'Material Inquiry' ? (
              <MaterialInquiryTable
                currentRows={currentRows}
                textColor={textColor}
                borderColor={borderColor}
              />
            ) : currentTable === 'Material Replenish' ? (
              <MaterialReplenishTable
                currentRows={currentRows}
                textColor={textColor}
                borderColor={borderColor}
              />
            ) : currentTable === 'Customer Delivery' ? (
              <CustomerDeliveryTable
                currentRows={currentRows}
                textColor={textColor}
                borderColor={borderColor}
              />
            ) : currentTable === 'Daily Worker Report' ? (
              <DailyWorkerReportTable
                currentRows={currentRows}
                textColor={textColor}
                borderColor={borderColor}
              />
            ) : null}
          </div>
        </CardBody>

        {/* Pagination Footer has been removed */}
        
      </Card>
    </Flex>
  );
}

export default Tables;