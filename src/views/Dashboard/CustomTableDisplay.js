import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom"; // Import useHistory for navigation
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Box,
  Text,
  Tooltip,
  Flex,
  Icon,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure
} from "@chakra-ui/react";
import { 
  SearchIcon, 
  DownloadIcon, 
  AddIcon, 
  ChevronDownIcon, 
  EditIcon,
  DeleteIcon,
  ViewIcon // Added ViewIcon for the view button
} from "@chakra-ui/icons";

// Custom components - use Box as replacement for Card/Card/CardHeader
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

// API base URL - updated to the deployed backend URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const CustomTableDisplay = () => {
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [newRecord, setNewRecord] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const history = useHistory(); // Add history for navigation
  
  // Get current user from localStorage or sessionStorage (similar to SupplierInfo)
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || {};

  const rowsPerPage = 5;
  
  // Load saved table configurations when component mounts
  useEffect(() => {
    loadSavedTables();
  }, []);

  // Load table data when current table changes
  useEffect(() => {
    if (currentTable) {
      loadTableData(currentTable._id);
    }
  }, [currentTable]);

  // Apply filters when search term or filters change
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
      
      // Modified to include user email for user-specific tables
      const response = await axios.post(
        `${API_BASE_URL}/api/custom-tables/get-all`, 
        { email: user.email },
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
      
      // Changed from POST to GET with query parameters
      const response = await axios.get(
        `${API_BASE_URL}/api/custom-tables/${tableId}/data`,
        { 
          params: { email: user.email }, 
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

  // Function to navigate to the ReadOnlyTableDisplay page
  const navigateToReadOnlyView = () => {
    if (!currentTable) return;
    
    // Get user role to determine the correct routing path
    const userData = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || {};
    const userRole = userData.role || "client"; // Default to client if no role found
    
    // Navigate to the correct path based on user role
    history.push(`/${userRole}/ReadOnlyTableDisplay/${currentTable._id}`);
  };

  const handleAddRecord = async () => {
    try {
      // Validate required fields
      const missingFields = currentTable.columns
        .filter(col => col.required)
        .filter(col => !newRecord[col.name]);
        
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Missing required fields: ${missingFields.map(f => f.name).join(', ')}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Include user info when adding record
      await axios.post(
        `${API_BASE_URL}/api/custom-tables/${currentTable._id}/data`, 
        { ...newRecord, userEmail: user.email },
        { withCredentials: true }
      );
      
      toast({
        title: "Success",
        description: "Record added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Reload table data
      loadTableData(currentTable._id);
      
      // Close modal and reset form
      onClose();
      setNewRecord({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateRecord = async () => {
    try {
      // Validate required fields
      const missingFields = currentTable.columns
        .filter(col => col.required)
        .filter(col => !editingRecord[col.name]);
        
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Missing required fields: ${missingFields.map(f => f.name).join(', ')}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Include user info when updating
      await axios.put(
        `${API_BASE_URL}/api/custom-tables/${currentTable._id}/data/${editingRecord._id}`, 
        { ...editingRecord, userEmail: user.email },
        { withCredentials: true }
      );
      
      toast({
        title: "Success",
        description: "Record updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Reload table data
      loadTableData(currentTable._id);
      
      // Close modal and reset form
      onClose();
      setEditingRecord(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update record",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        // Include user email in the delete request
        await axios.delete(
          `${API_BASE_URL}/api/custom-tables/${currentTable._id}/data/${recordId}`,
          { 
            data: { userEmail: user.email },
            withCredentials: true
          }
        );
        
        toast({
          title: "Success",
          description: "Record deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reload table data
        loadTableData(currentTable._id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete record",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const exportToCSV = () => {
    if (!currentTable || !filteredData.length) return;
    
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add column headers
    const headers = currentTable.columns.map(col => col.name);
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    filteredData.forEach(row => {
      const rowValues = headers.map(header => {
        const value = row[header];
        // Handle commas in text values by quoting
        return value ? `"${value}"` : "";
      });
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

  const handleInputChange = (field, value) => {
    if (editingRecord) {
      setEditingRecord({
        ...editingRecord,
        [field]: value
      });
    } else {
      setNewRecord({
        ...newRecord,
        [field]: value
      });
    }
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setNewRecord({});
    onOpen();
  };

  const openEditModal = (record) => {
    setNewRecord({});
    setEditingRecord({...record});
    onOpen();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Get unique values for filter dropdowns
  const getUniqueValuesForColumn = (columnName) => {
    if (!tableData.length) return [];
    
    const uniqueValues = [...new Set(tableData.map(record => record[columnName]))]
      .filter(value => value !== undefined && value !== null);
    
    return uniqueValues.sort();
  };

  // Get user role for permission checks
  const isAdmin = user.role === "admin";

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
          {/* Left Side: Dropdown Menu for table selection and user info */}
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
              {user.email && <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                ({user.email})
              </Text>}
            </Text>
          </HStack>

          {/* Right Side: Search Bar and Buttons */}
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
            {/* View Button */}
            <Button 
              colorScheme="teal" 
              size="sm" 
              height={9} 
              onClick={navigateToReadOnlyView}
              isDisabled={!currentTable}
              leftIcon={<ViewIcon />}
            >
              View
            </Button>
            <Button colorScheme="blue" size="sm" height={9} width={20} onClick={handleClearSearch}>Clear</Button>
            <Button 
              colorScheme="green" 
              size="sm" 
              height={9} 
              onClick={openAddModal}
              isDisabled={!currentTable}
              leftIcon={<AddIcon />}
            >
              Add New
            </Button>
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
              {/* Filter dropdowns for columns */}
              {currentTable.columns.length > 0 && (
                <HStack spacing={4} mb={5} overflowX="auto" py={2}>
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
              )}
              
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
                        {column.name} {column.required && <span style={{color: 'red'}}>*</span>}
                      </Th>
                    ))}
                    <Th pl="25px" pr="25px" color="gray.600" fontWeight="bold">Actions</Th>
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
                        <Td pl="25px" pr="25px">
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              colorScheme="blue"
                              icon={<EditIcon />}
                              onClick={() => openEditModal(row)}
                              aria-label="Edit record"
                              isDisabled={row.userEmail && row.userEmail !== user.email && !isAdmin}
                            />
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              icon={<DeleteIcon />}
                              onClick={() => handleDeleteRecord(row._id)}
                              aria-label="Delete record"
                              isDisabled={row.userEmail && row.userEmail !== user.email && !isAdmin}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={currentTable.columns.length + 1} textAlign="center" py={4}>
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

      {/* Add/Edit Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingRecord ? "Edit Record" : "Add New Record"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentTable?.columns.map(column => (
              <FormControl key={column.name} mb={4} isRequired={column.required}>
                <FormLabel>
                  {column.name}
                  {column.required && <span style={{color: 'red'}}>*</span>}
                </FormLabel>
                
                {column.type === 'text' && (
                  <Input
                    value={editingRecord ? editingRecord[column.name] || '' : newRecord[column.name] || ''}
                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                    placeholder={`Enter ${column.name}`}
                  />
                )}
                
                {column.type === 'number' && (
                  <Input
                    type="number"
                    value={editingRecord ? editingRecord[column.name] || '' : newRecord[column.name] || ''}
                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                    placeholder={`Enter ${column.name}`}
                  />
                )}
                
                {column.type === 'date' && (
                  <Input
                    type="date"
                    value={editingRecord ? 
                      (editingRecord[column.name] ? new Date(editingRecord[column.name]).toISOString().split('T')[0] : '') : 
                      (newRecord[column.name] ? new Date(newRecord[column.name]).toISOString().split('T')[0] : '')
                    }
                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                  />
                )}
                
                {column.type === 'email' && (
                  <Input
                    type="email"
                    value={editingRecord ? editingRecord[column.name] || '' : newRecord[column.name] || ''}
                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                    placeholder={`Enter ${column.name}`}
                  />
                )}
                
                {column.type === 'select' && (
                  <Select
                    value={editingRecord ? editingRecord[column.name] || '' : newRecord[column.name] || ''}
                    onChange={(e) => handleInputChange(column.name, e.target.value)}
                    placeholder={`Select ${column.name}`}
                  >
                    {getUniqueValuesForColumn(column.name).map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </Select>
                )}
              </FormControl>
            ))}
            
            {/* Hidden field for user email */}
            <input 
              type="hidden" 
              name="userEmail" 
              value={user.email || ''} 
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
            >
              {editingRecord ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default CustomTableDisplay;