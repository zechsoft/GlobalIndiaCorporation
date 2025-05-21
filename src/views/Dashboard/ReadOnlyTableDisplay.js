import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
  Text,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from "@chakra-ui/react";
import { 
  SearchIcon, 
  DownloadIcon, 
  ChevronDownIcon,
  ViewIcon,
  ViewOffIcon,
  EditIcon,
  DeleteIcon
} from "@chakra-ui/icons";

// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

const ReadOnlyTableDisplay = () => {
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreator, setShowCreator] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Backend API base URL - updated to deployed URL
  const API_BASE_URL = "https://globalindiabackendnew.onrender.com";
  
  // Get current user from localStorage or sessionStorage
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || {};

  const rowsPerPage = 10;
  
  useEffect(() => {
    loadSavedTables();
    // Check if user is admin
    setIsAdmin(user.role === 'admin' || user.isAdmin === true);
  }, []);

  useEffect(() => {
    if (currentTable) {
      loadTableData(currentTable._id);
    }
  }, [currentTable]);

  useEffect(() => {
    if (!tableData.length) {
      setFilteredData([]);
      return;
    }

    let results = [...tableData];
    
    // Apply search filter across all columns
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(record => {
        return Object.values(record).some(value => 
          value && value.toString().toLowerCase().includes(term)
        );
      });
    }
    
    // Apply column-specific filters
    Object.entries(filters).forEach(([column, value]) => {
      if (value && value !== "All") {
        results = results.filter(record => 
          record[column] && record[column].toString() === value
        );
      }
    });
    
    setFilteredData(results);
  }, [searchTerm, filters, tableData]);

  const loadSavedTables = async () => {
    try {
      setIsLoading(true);
      
      // Request all tables with isAdmin flag to see all tables
      const response = await axios.post(
        `${API_BASE_URL}/api/custom-tables/get-all`, 
        { email: user.email, isAdmin: true },
        { withCredentials: true }
      );
      
      setTables(response.data.tables || []);
      
      // Set first table as current if available
      if (response.data.tables && response.data.tables.length > 0) {
        setCurrentTable(response.data.tables[0]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load saved tables:", error);
      setError("Failed to load saved table configurations");
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to load saved table configurations",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadTableData = async (tableId) => {
    try {
      setIsLoading(true);
      
      // Request all data with isAdmin flag to see all entries regardless of owner
      const response = await axios.get(
        `${API_BASE_URL}/api/custom-tables/${tableId}/data`,
        { 
          params: { email: user.email, isAdmin: true }, 
          withCredentials: true 
        }
      );
      
      setTableData(response.data.records || []);
      setFilteredData(response.data.records || []);
      
      // Reset search and filters
      setSearchTerm("");
      setFilters({});
      setCurrentPage(1);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load table data:", error);
      setError("Failed to load table data");
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to load table data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const exportToCSV = () => {
    if (!currentTable || !filteredData.length) return;
    
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add column headers
    const headers = currentTable.columns.map(col => col.name);
    
    // Add creator column only if showCreator is true
    const csvHeaders = showCreator ? [...headers, 'Created By'] : headers;
    csvContent += csvHeaders.join(',') + '\n';
    
    // Add data rows
    filteredData.forEach(row => {
      const rowValues = headers.map(header => {
        const value = row[header];
        // Handle commas in text values by quoting
        return value ? `"${value}"` : "";
      });
      
      // Add creator email to last column if showCreator is true
      if (showCreator) {
        rowValues.push(row.userEmail || "");
      }
      
      csvContent += rowValues.join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentTable.name}-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredData.length} records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Toggle creator column visibility
  const toggleCreatorColumn = () => {
    setShowCreator(!showCreator);
  };

  // Get unique values for filter dropdowns
  const getUniqueValuesForColumn = (columnName) => {
    if (!tableData.length) return [];
    
    const uniqueValues = [...new Set(tableData.map(record => record[columnName]))]
      .filter(value => value !== undefined && value !== null);
    
    return uniqueValues.sort();
  };

  // Get unique users who contributed data
  const getUniqueUsers = () => {
    if (!tableData.length) return [];
    
    const uniqueUsers = [...new Set(tableData.map(record => record.userEmail))]
      .filter(email => email !== undefined && email !== null);
    
    return uniqueUsers.sort();
  };

  // Handle edit click
  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditFormData({...record});
    onOpen();
  };
  
  // Handle form field changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  // Save edits
  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/custom-tables/${currentTable._id}/data/${editingRecord._id}`,
        {
          ...editFormData,
          userEmail: user.email,
          isAdmin
        },
        { withCredentials: true }
      );
      
      // Update the table data
      const updatedData = tableData.map(record => 
        record._id === editingRecord._id ? response.data.data : record
      );
      
      setTableData(updatedData);
      
      toast({
        title: "Success",
        description: "Record updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to update record:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Delete record
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }
    
    try {
      await axios.delete(
        `${API_BASE_URL}/api/custom-tables/${currentTable._id}/data/${recordId}`,
        { 
          data: { userEmail: user.email, isAdmin },
          withCredentials: true 
        }
      );
      
      // Remove the deleted record from the data
      const updatedData = tableData.filter(record => record._id !== recordId);
      setTableData(updatedData);
      
      toast({
        title: "Success",
        description: "Record deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to delete record:", error);
      
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Render edit modal
  const renderEditModal = () => {
    if (!editingRecord || !currentTable) return null;
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentTable.columns.map(column => (
              <FormControl key={column.name} mt={4}>
                <FormLabel>{column.name}</FormLabel>
                {column.type === 'date' ? (
                  <Input
                    name={column.name}
                    type="date"
                    value={editFormData[column.name] ? new Date(editFormData[column.name]).toISOString().split('T')[0] : ''}
                    onChange={handleEditFormChange}
                  />
                ) : column.type === 'number' ? (
                  <Input
                    name={column.name}
                    type="number"
                    value={editFormData[column.name] || ''}
                    onChange={handleEditFormChange}
                  />
                ) : (
                  <Input
                    name={column.name}
                    value={editFormData[column.name] || ''}
                    onChange={handleEditFormChange}
                  />
                )}
              </FormControl>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  if (isLoading && !currentTable) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading tables...</Text>
      </Box>
    );
  }

  if (error && !currentTable && !tables.length) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!tables.length) {
    return (
      <Alert status="info">
        <AlertIcon />
        No custom tables found. Please create a table first.
      </Alert>
    );
  }

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
        <CardHeader p="6px 0px 22px 0px" display="flex" justifyContent="space-between" alignItems="center">
          {/* Left Side: Dropdown Menu for table selection */}
          <HStack spacing={5}>
            <Menu>
              <MenuButton as={IconButton} icon={<ChevronDownIcon />} variant="outline" />
              <MenuList>
                {tables.map(table => (
                  <MenuItem 
                    key={table._id} 
                    onClick={() => setCurrentTable(table)}
                  >
                    {table.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            {/* Table Name */}
            <Text fontSize="xl" fontWeight="bold" ml={7}>
              {currentTable?.name || "Select a Table"} 
              <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                (Read-Only View)
              </Text>
            </Text>
          </HStack>

          {/* Right Side: Controls */}
          <HStack spacing={4} ml="auto">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                size="md"
                height={8}
              />
            </InputGroup>
            <Button colorScheme="blue" size="sm" height={9} width={20} onClick={handleClearSearch}>Clear</Button>
            
            {/* Creator Column Toggle */}
            <FormControl display="flex" alignItems="center" w="auto">
              <FormLabel htmlFor="creator-switch" mb="0" fontSize="sm" whiteSpace="nowrap">
                {showCreator ? "Hide Creator" : "Show Creator"}
              </FormLabel>
              <Switch 
                id="creator-switch" 
                isChecked={showCreator} 
                onChange={toggleCreatorColumn} 
                colorScheme="blue"
              />
            </FormControl>
            
            <Button 
              leftIcon={<DownloadIcon />} 
              colorScheme="blue" 
              size="sm"
              height={9}
              onClick={exportToCSV}
              isDisabled={!filteredData.length}
            >
              Export CSV
            </Button>
          </HStack>
        </CardHeader>

        {/* Table Body */}
        <CardBody>
          {isLoading && currentTable ? (
            <Box p={5} textAlign="center">
              <Spinner size="xl" />
              <Text mt={3}>Loading data...</Text>
            </Box>
          ) : currentTable ? (
            <div style={{ overflowX: 'auto', position: 'relative' }}>
              {/* Filter dropdowns */}
              <HStack spacing={4} mb={5} overflowX="auto" py={2}>
                {/* User filter dropdown - only show if creator column is visible */}
                {showCreator && getUniqueUsers().length > 1 && (
                  <Select 
                    maxW="200px" 
                    value={filters['userEmail'] || "All"}
                    onChange={(e) => setFilters({...filters, 'userEmail': e.target.value})}
                    size="sm"
                  >
                    <option value="All">All Users</option>
                    {getUniqueUsers().map(email => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </Select>
                )}
                
                {/* Column filters */}
                {currentTable.columns
                  .filter(col => getUniqueValuesForColumn(col.name).length > 1 && getUniqueValuesForColumn(col.name).length < 10)
                  .map(column => (
                    <Select 
                      key={column.name}
                      maxW="200px" 
                      value={filters[column.name] || "All"}
                      onChange={(e) => setFilters({...filters, [column.name]: e.target.value})}
                      size="sm"
                    >
                      <option value="All">All {column.name}</option>
                      {getUniqueValuesForColumn(column.name).map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </Select>
                  ))}
              </HStack>
              
              {/* Results count */}
              <Text mb={3}>
                Showing {currentRows.length} of {filteredData.length} records
                {filteredData.length !== tableData.length && ` (filtered from ${tableData.length} total)`}
              </Text>
              
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr my=".8rem" pl="0px">
                    {currentTable.columns.map(column => (
                      <Th key={column.name} pl="25px" pr="25px" color="gray.600" fontWeight="bold">
                        {column.name}
                      </Th>
                    ))}
                    {/* Only show Creator column if showCreator is true */}
                    {showCreator && (
                      <Th pl="25px" pr="25px" color="gray.600" fontWeight="bold">Created By</Th>
                    )}
                    {/* Add Actions column for admin users */}
                    {isAdmin && (
                      <Th pl="25px" pr="25px" color="gray.600" fontWeight="bold">Actions</Th>
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((row, rowIndex) => (
                      <Tr key={rowIndex} _hover={{ bg: "gray.50" }}>
                        {currentTable.columns.map(column => (
                          <Td key={column.name} pl="25px" pr="25px">
                            {column.type === 'date' 
                              ? new Date(row[column.name]).toLocaleDateString() 
                              : column.type === 'number'
                                ? Number(row[column.name]).toLocaleString()
                                : row[column.name]}
                          </Td>
                        ))}
                        {/* Only show Creator column if showCreator is true */}
                        {showCreator && (
                          <Td pl="25px" pr="25px">
                            {row.userEmail || "Unknown"}
                          </Td>
                        )}
                        {/* Add Actions column for admin users */}
                        {isAdmin && (
                          <Td pl="25px" pr="25px">
                            <HStack spacing={2}>
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEditClick(row)}
                                aria-label="Edit record"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleDeleteRecord(row._id)}
                                aria-label="Delete record"
                              />
                            </HStack>
                          </Td>
                        )}
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={showCreator ? currentTable.columns.length + 1 + (isAdmin ? 1 : 0) : currentTable.columns.length + (isAdmin ? 1 : 0)} textAlign="center" py={4}>
                        No data found matching current filters
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </div>
          ) : (
            <Box p={5} textAlign="center">
              <Text>Select a table to view data</Text>
            </Box>
          )}
        </CardBody>

        {/* Pagination Footer */}
        {currentTable && filteredData.length > 0 && (
          <Flex justify="space-between" align="center" mt={4} px={4} mb={2}>
            <Text fontSize="sm" color="gray.500">Page {currentPage} of {totalPages}</Text>
            <Flex gap={2}>
              <Button size="sm" variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
              <Button size="sm" variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
            </Flex>
          </Flex>
        )}
      </Card>
      {renderEditModal()}
    </Flex>
  );
};

export default ReadOnlyTableDisplay;