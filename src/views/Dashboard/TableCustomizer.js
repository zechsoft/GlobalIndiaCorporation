import React, { useState, useEffect } from "react";
import { 
  Box, 
  Heading, 
  Button, 
  Input, 
  SimpleGrid, 
  FormControl,
  FormLabel,
  Divider,
  useToast,
  Flex,
  IconButton,
  Text,
  Stack,
  Badge,
  Select,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Switch,
  Tooltip,
  Container
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, CheckIcon, EditIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import CustomTable from "./CustomTableDisplay.js"; // Adjust path if needed
import axios from "axios";

// Define the base API URL for the deployed backend
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const TableCustomizer = () => {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([{ name: "", type: "text", required: true }]);
  const [isPublic, setIsPublic] = useState(false);
  const [savedTables, setSavedTables] = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // State for editing table schema
  const [editingTable, setEditingTable] = useState(null);
  const [editTableName, setEditTableName] = useState("");
  const [editColumns, setEditColumns] = useState([]);
  const [editIsPublic, setEditIsPublic] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get current user from localStorage or sessionStorage
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || {};
  const isAdmin = user.role === "admin";

  // Load saved table configurations on component mount
  useEffect(() => {
    loadSavedTables();
  }, []);

  const loadSavedTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use POST to include user email and admin status
      const response = await axios.post(
        `${API_BASE_URL}/api/custom-tables/get-all`,
        { email: user.email, isAdmin },
        { withCredentials: true }
      );
      
      setSavedTables(response.data.tables || []);
    } catch (error) {
      console.error("Failed to load saved tables:", error);
      setError("Failed to load saved tables. Please check your connection and try again.");
      toast({
        title: "Error",
        description: "Failed to load saved table configurations",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddColumn = () => {
    setColumns([...columns, { name: "", type: "text", required: true }]);
  };

  const handleRemoveColumn = (index) => {
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleCreateTable = async () => {
    // Validate inputs
    if (!tableName.trim()) {
      toast({
        title: "Validation Error",
        description: "Table name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if there are columns defined and all have names
    if (columns.length === 0 || columns.some(col => !col.name.trim())) {
      toast({
        title: "Validation Error",
        description: "All columns must have names",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Prepare table configuration
    const tableConfig = {
      name: tableName,
      columns: columns,
      userEmail: user.email,  // Include creator email
      isPublic: isPublic,     // Include public flag
      createdAt: new Date()
    };

    try {
      // Save the table configuration
      const response = await axios.post(
        `${API_BASE_URL}/api/custom-tables/create`, 
        tableConfig,
        { withCredentials: true }
      );
      
      toast({
        title: "Success",
        description: `Table "${tableName}" created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and reload saved tables
      setTableName("");
      setColumns([{ name: "", type: "text", required: true }]);
      setIsPublic(false);
      await loadSavedTables();
      
      // Optionally activate the newly created table
      if (response.data.table) {
        setActiveTable(response.data.table);
      }
    } catch (error) {
      console.error("Error creating table:", error);
      toast({
        title: "Error",
        description: "Failed to create table",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const activateTable = (table) => {
    setActiveTable(table);
  };

  const deleteTable = async (tableId) => {
    try {
      // Include user information for permission check
      await axios.delete(
        `${API_BASE_URL}/api/custom-tables/${tableId}`,
        { 
          data: { userEmail: user.email, isAdmin },
          withCredentials: true
        }
      );
      
      toast({
        title: "Success",
        description: "Table deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset active table if it was deleted
      if (activeTable && activeTable._id === tableId) {
        setActiveTable(null);
      }
      
      // Reload saved tables
      loadSavedTables();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to delete table";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ===== Functions for editing table schema =====

  const openEditTableModal = (table) => {
    setEditingTable(table);
    setEditTableName(table.name);
    setEditColumns([...table.columns]);
    setEditIsPublic(table.isPublic || false);
    onOpen();
  };

  const handleAddEditColumn = () => {
    setEditColumns([...editColumns, { name: "", type: "text", required: true }]);
  };

  const handleRemoveEditColumn = (index) => {
    const newEditColumns = [...editColumns];
    newEditColumns.splice(index, 1);
    setEditColumns(newEditColumns);
  };

  const handleEditColumnChange = (index, field, value) => {
    const newEditColumns = [...editColumns];
    newEditColumns[index][field] = value;
    setEditColumns(newEditColumns);
  };

  const handleUpdateTableSchema = async () => {
    // Validate inputs
    if (!editTableName.trim()) {
      toast({
        title: "Validation Error",
        description: "Table name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if there are columns defined and all have names
    if (editColumns.length === 0 || editColumns.some(col => !col.name.trim())) {
      toast({
        title: "Validation Error",
        description: "All columns must have names",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Prepare updated table configuration
    const updatedTableConfig = {
      name: editTableName,
      columns: editColumns,
      userEmail: user.email,
      isAdmin,
      isPublic: editIsPublic
    };

    try {
      // Update the table configuration
      const response = await axios.put(
        `${API_BASE_URL}/api/custom-tables/${editingTable._id}`, 
        updatedTableConfig,
        { withCredentials: true }
      );
      
      toast({
        title: "Success",
        description: `Table "${editTableName}" updated successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Close modal
      onClose();
      
      // Get the updated table data
      const updatedTable = response.data.table || {
        ...editingTable,
        name: editTableName,
        columns: editColumns,
        isPublic: editIsPublic
      };
      
      // Update active table immediately if it was the one edited
      if (activeTable && activeTable._id === editingTable._id) {
        setActiveTable(updatedTable);
      }
      
      // Then reload all saved tables
      await loadSavedTables();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to update table schema";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Updated function to allow admins to edit/delete public tables and their own tables
  const canModifyTable = (table) => {
    return isAdmin || // Admin can edit any table
           (table.createdBy === user.email) || // Owner can edit their own table
           (isAdmin && table.isPublic); // Additional check for admin to edit public tables
  };

  return (
    // Main white container wrapper
    <Container maxW="container.xl" p={0}>
      <Box 
        bg="white" 
        boxShadow="xl" 
        borderRadius="lg" 
        p={6} 
        mb={10} 
        border="1px" 
        borderColor="gray.100"
      >
        <Heading mb={6}>Table Customizer</Heading>
        
        {/* Create New Table Section */}
        <Box mb={6} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" bg="gray.50" p={1}>
          <Box p={5} bg="white" borderRadius="md">
            <Heading size="md" mb={4}>Create New Table</Heading>
            
            <FormControl mb={4}>
              <FormLabel>Table Name</FormLabel>
              <Input 
                value={tableName} 
                onChange={(e) => setTableName(e.target.value)} 
                placeholder="Enter table name" 
              />
            </FormControl>
            
            {/* Public table toggle - only show for admins */}
            {isAdmin && (
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="is-public" mb="0">
                  Make Table Public (visible to all users)
                </FormLabel>
                <Switch 
                  id="is-public" 
                  isChecked={isPublic} 
                  onChange={(e) => setIsPublic(e.target.checked)} 
                />
              </FormControl>
            )}
            
            <Heading size="sm" mb={2}>Define Columns</Heading>
            
            {columns.map((column, index) => (
              <Flex key={index} mb={3} gap={3} align="center">
                <FormControl flex="2">
                  <Input 
                    value={column.name} 
                    onChange={(e) => handleColumnChange(index, "name", e.target.value)} 
                    placeholder="Column name" 
                  />
                </FormControl>
                
                <FormControl flex="1">
                  <Select
                    value={column.type}
                    onChange={(e) => handleColumnChange(index, "type", e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="select">Dropdown</option>
                  </Select>
                </FormControl>
                
                <FormControl flex="1">
                  <Select
                    value={column.required}
                    onChange={(e) => handleColumnChange(index, "required", e.target.value === "true")}
                  >
                    <option value="true">Required</option>
                    <option value="false">Optional</option>
                  </Select>
                </FormControl>
                
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleRemoveColumn(index)}
                  isDisabled={columns.length === 1}
                  aria-label="Remove column"
                />
              </Flex>
            ))}
            
            <Button 
              leftIcon={<AddIcon />} 
              onClick={handleAddColumn} 
              size="sm" 
              mb={4}
            >
              Add Column
            </Button>
            
            <Divider my={4} />
            
            <Button 
              colorScheme="blue" 
              onClick={handleCreateTable}
              leftIcon={<CheckIcon />}
            >
              Create Table
            </Button>
          </Box>
        </Box>
        
        {/* Saved Tables Section */}
        <Box mb={8}>
          <Heading size="md" mb={4}>Saved Table Configurations</Heading>
          
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Text>Loading saved tables...</Text>
            </Box>
          ) : error ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          ) : savedTables.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {savedTables.map((table) => (
                <Box 
                  key={table._id} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  overflow="hidden" 
                  _hover={{ boxShadow: "md" }} 
                  boxShadow="sm"
                  backgroundColor={activeTable && activeTable._id === table._id ? "blue.50" : "white"}
                >
                  <Box p={4}>
                    <Stack spacing={3}>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Heading size="sm">{table.name}</Heading>
                        {table.isPublic ? (
                          <Tooltip label={isAdmin ? "Public table - visible to all users (admins can edit)" : "Public table - visible to all users"}>
                            <Badge colorScheme="green" display="flex" alignItems="center">
                              <UnlockIcon mr={1} /> Public
                            </Badge>
                          </Tooltip>
                        ) : (
                          <Tooltip label="Private table - only visible to creator">
                            <Badge colorScheme="purple" display="flex" alignItems="center">
                              <LockIcon mr={1} /> Private
                            </Badge>
                          </Tooltip>
                        )}
                      </Flex>
                      <Text fontSize="sm">{table.columns.length} columns</Text>
                      {table.createdBy && (
                        <Text fontSize="xs" color="gray.500">
                          Created by: {table.createdBy === user.email ? "You" : table.createdBy}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.500">
                        Created: {new Date(table.createdAt).toLocaleDateString()}
                      </Text>
                      <Flex justify="space-between">
                        <Button 
                          size="sm" 
                          colorScheme={activeTable && activeTable._id === table._id ? "green" : "blue"}
                          onClick={() => activateTable(table)}
                        >
                          {activeTable && activeTable._id === table._id ? "Active" : "Use Table"}
                        </Button>
                        <Flex gap={2}>
                          <IconButton
                            size="sm"
                            colorScheme="teal"
                            aria-label="Edit table"
                            icon={<EditIcon />}
                            onClick={() => openEditTableModal(table)}
                            isDisabled={!canModifyTable(table)}
                            _hover={{ bg: isAdmin && table.isPublic ? "teal.500" : undefined }}
                          />
                          <IconButton
                            size="sm"
                            colorScheme="red"
                            aria-label="Delete table"
                            icon={<DeleteIcon />}
                            onClick={() => deleteTable(table._id)}
                            isDisabled={!canModifyTable(table)}
                          />
                        </Flex>
                      </Flex>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Alert status="info" mb={4}>
              <AlertIcon />
              No saved tables found. Create one above.
            </Alert>
          )}
        </Box>
        
        {/* Active Table Section */}
        {activeTable && (
          <Box mt={8} p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="md">
            <Heading size="md" mb={4}>
              Working with "{activeTable.name}"
              <Badge ml={2} colorScheme="green">Active</Badge>
              {activeTable.isPublic && (
                <Badge ml={2} colorScheme="blue">Public</Badge>
              )}
            </Heading>
            <CustomTable key={`table-${activeTable._id}-${JSON.stringify(activeTable.columns)}`} table={activeTable} />
          </Box>
        )}

        {/* Edit Table Schema Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Edit Table Schema: {editingTable?.name}
              {editingTable?.isPublic && isAdmin && !editingTable?.createdBy === user.email && (
                <Badge ml={2} colorScheme="blue">Admin Edit of Public Table</Badge>
              )}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <Text>
                  Warning: Changing column types or removing columns may affect existing data. 
                  Adding new columns or making columns optional is safer.
                </Text>
              </Alert>

              <FormControl mb={4}>
                <FormLabel>Table Name</FormLabel>
                <Input 
                  value={editTableName} 
                  onChange={(e) => setEditTableName(e.target.value)} 
                  placeholder="Enter table name" 
                />
              </FormControl>
              
              {/* Public table toggle in edit modal - only show for admins */}
              {isAdmin && (
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel htmlFor="edit-is-public" mb="0">
                    Make Table Public (visible to all users)
                  </FormLabel>
                  <Switch 
                    id="edit-is-public" 
                    isChecked={editIsPublic} 
                    onChange={(e) => setEditIsPublic(e.target.checked)} 
                  />
                </FormControl>
              )}
              
              <Heading size="sm" mb={2}>Columns</Heading>
              
              {editColumns.map((column, index) => (
                <Flex key={index} mb={3} gap={3} align="center">
                  <FormControl flex="2">
                    <Input 
                      value={column.name} 
                      onChange={(e) => handleEditColumnChange(index, "name", e.target.value)} 
                      placeholder="Column name" 
                    />
                  </FormControl>
                  
                  <FormControl flex="1">
                    <Select
                      value={column.type}
                      onChange={(e) => handleEditColumnChange(index, "type", e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="email">Email</option>
                      <option value="select">Dropdown</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl flex="1">
                    <Select
                      value={column.required}
                      onChange={(e) => handleEditColumnChange(index, "required", e.target.value === "true")}
                    >
                      <option value="true">Required</option>
                      <option value="false">Optional</option>
                    </Select>
                  </FormControl>
                  
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleRemoveEditColumn(index)}
                    isDisabled={editColumns.length === 1}
                    aria-label="Remove column"
                  />
                </Flex>
              ))}
              
              <Button 
                leftIcon={<AddIcon />} 
                onClick={handleAddEditColumn} 
                size="sm" 
                mb={4}
              >
                Add Column
              </Button>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleUpdateTableSchema}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Container>
  );
};

export default TableCustomizer;