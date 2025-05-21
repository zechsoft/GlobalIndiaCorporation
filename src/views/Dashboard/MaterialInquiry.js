import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Input,
  Select,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
  Checkbox,
  Stack,
  Badge
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { HamburgerIcon } from "@chakra-ui/icons";
import { CogIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Base URL for the backend API
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

// Default table headers configuration
const DEFAULT_HEADERS = [
  { id: "id", label: "#", visible: true },
  { id: "supplierMaterial", label: "Supplier Material", visible: true, altKey: "Suppliermaterial" },
  { id: "supplementOrderNumber", label: "Supplement Order Number", visible: true, altKey: "OrderNumber" },
  { id: "status", label: "Status", visible: true },
  { id: "explanation", label: "Explanation", visible: true, altKey: "explaination" },
  { id: "createTime", label: "Create Time", visible: true, altKey: "createdTime" },
  { id: "updateTime", label: "Update Time", visible: true }
];

const MaterialInquiry = () => {
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"));
  const toast = useToast();
  const [tableData, setTableData] = useState([
    {
      id: 1,
      supplierMaterial: "Material A",
      supplementOrderNumber: "SO123",
      status: "Active",
      explanation: "Initial order",
      createTime: "2023-04-18",
      updateTime: "2023-04-18",
    },
    {
      id: 2,
      supplierMaterial: "Material B",
      supplementOrderNumber: "SO124",
      status: "Inactive",
      explanation: "Supplement order",
      createTime: "2023-04-19",
      updateTime: "2023-04-19",
    },
  ]);

  const [filteredData, setFilteredData] = useState(tableData);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [newRow, setNewRow] = useState({
    supplierMaterial: "",
    supplementOrderNumber: "",
    status: "",
    explanation: "",
    createTime: "",
    updateTime: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [tableHeaders, setTableHeaders] = useState(DEFAULT_HEADERS);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [tempHeaders, setTempHeaders] = useState([]);
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderName, setNewHeaderName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: "",
    label: "",
    visible: true,
    altKey: ""
  });
  const [isAddHeaderModalOpen, setIsAddHeaderModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMaterialDetails, setSelectedMaterialDetails] = useState(null);

  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from backend
        const response = await axios.post(
          `${API_BASE_URL}/api/material-inquiry/get-data`, 
          {"email": user.email}, 
          {withCredentials: true}
        );
        
        setTableData(response.data.data);
        setFilteredData(response.data.data);
        
        return true;
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          description: "There was an error loading the material inquiry data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        return false;
      }
    };
    

    fetchData();

    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('materialInquiryTableHeaders', JSON.stringify(tableHeaders));
  }, [tableHeaders]);

  // Header management functions
  const openHeaderModal = () => {
    setTempHeaders([...tableHeaders]);
    setIsHeaderModalOpen(true);
    setEditingHeader(null);
  };

  const handleHeaderVisibilityChange = (index) => {
    const updatedHeaders = [...tempHeaders];
    updatedHeaders[index].visible = !updatedHeaders[index].visible;
    setTempHeaders(updatedHeaders);
  };

  const handleEditHeaderLabel = (index) => {
    setEditingHeader(index);
    setNewHeaderName(tempHeaders[index].label);
  };

  const saveHeaderLabel = () => {
    if (editingHeader !== null && newHeaderName.trim()) {
      const updatedHeaders = [...tempHeaders];
      updatedHeaders[editingHeader].label = newHeaderName.trim();
      setTempHeaders(updatedHeaders);
      setEditingHeader(null);
      setNewHeaderName("");
    }
  };

  const moveHeader = (index, direction) => {
    if ((direction < 0 && index === 0) || (direction > 0 && index === tempHeaders.length - 1)) {
      return;
    }
    
    const updatedHeaders = [...tempHeaders];
    const temp = updatedHeaders[index];
    updatedHeaders[index] = updatedHeaders[index + direction];
    updatedHeaders[index + direction] = temp;
    setTempHeaders(updatedHeaders);
  };

  const saveHeaderChanges = async () => {
    try {
      // Send updated headers to backend - now using material-inquiry specific endpoint
      await axios.post(`${API_BASE_URL}/api/table-headers/update-material-inquiry`, 
        { 
          headers: tempHeaders,
          isGlobal: isAdmin // This ensures admins update global headers
        },
        { withCredentials: true }
      );
      
      toast({
        title: isAdmin ? "Table headers updated globally" : "Table headers updated",
        description: isAdmin ? "All users will see your changes" : "Your personal view has been updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      // Update local state
      setTableHeaders(tempHeaders);
      setIsHeaderModalOpen(false);
      
      // Continue to store in localStorage as a backup
      localStorage.setItem('materialInquiryTableHeaders', JSON.stringify(tempHeaders));
      
    } catch (error) {
      console.error("Error saving header changes:", error);
      toast({
        title: "Error saving header changes",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteHeader = (index) => {
    if (!isAdmin) return;
    
    const updatedHeaders = [...tempHeaders];
    updatedHeaders.splice(index, 1);
    setTempHeaders(updatedHeaders);
  };

  const handleAddHeader = () => {
    if (!isAdmin) return;
    setIsAddHeaderModalOpen(true);
  };

  const saveNewHeader = () => {
    if (!newHeaderInfo.id || !newHeaderInfo.label) {
      toast({
        title: "Missing information",
        description: "Header ID and Label are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create new header and add to temp headers
    const newHeader = {
      id: newHeaderInfo.id,
      label: newHeaderInfo.label,
      visible: true,
      altKey: newHeaderInfo.altKey || null
    };
    
    setTempHeaders([...tempHeaders, newHeader]);
    setIsAddHeaderModalOpen(false);
    
    // Reset form
    setNewHeaderInfo({
      id: "",
      label: "",
      visible: true,
      altKey: ""
    });
  };

  const resetHeadersToDefault = () => {
    setTempHeaders([...DEFAULT_HEADERS]);
  };

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
    setNewRow({
      supplierMaterial: "",
      supplementOrderNumber: "",
      status: "",
      explanation: "",
      createTime: "",
      updateTime: "",
    });
  };

  const handleEditRow = (rowId) => {
    if (!rowId) {
      console.error("No row ID provided for editing");
      toast({
        title: "Error",
        description: "Could not edit row: missing ID",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    console.log("Attempting to edit row with ID:", rowId);
    console.log("Available rows:", tableData.map(row => ({ id: row.id, _id: row._id })));
    
    // Find the row in tableData by either id or _id
    const selectedRow = tableData.find((row) => 
      // Check if rowId matches either the MongoDB _id or regular id
      (row._id && (row._id === rowId || row._id.toString() === rowId)) || 
      (row.id && (row.id === rowId || row.id.toString() === rowId))
    );
    
    if (selectedRow) {
      console.log("Found row to edit:", selectedRow);
      
      // Map backend field names to frontend field names
      setNewRow({
        supplierMaterial: selectedRow.Suppliermaterial || selectedRow.supplierMaterial || "",
        supplementOrderNumber: selectedRow.OrderNumber || selectedRow.supplementOrderNumber || "",
        status: selectedRow.status || "",
        explanation: selectedRow.explaination || selectedRow.explanation || "",
        createTime: selectedRow.createdTime || selectedRow.createTime || "",
        updateTime: selectedRow.updateTime || ""
      });
      
      // Store the MongoDB _id if available, otherwise use id
      setSelectedRowId(selectedRow._id || selectedRow.id);
      setIsModalOpen(true);
    } else {
      console.error("Row not found for editing with ID:", rowId);
      toast({
        title: "Error",
        description: "Could not find the row to edit",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewDetails = (row) => {
    setSelectedMaterialDetails(row);
    setIsViewModalOpen(true);
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteAlertOpen(true);
  };

  // Update the confirmDelete function to handle MongoDB IDs correctly
  const confirmDelete = async () => {
    try {
      // Find the row to delete
      const rowToDeleteData = tableData.find(row => row.id === rowToDelete);
      
      if (!rowToDeleteData) {
        throw new Error("Row not found");
      }
      
      // Determine the ID to use for deletion (MongoDB _id or regular id)
      const idToDelete = rowToDeleteData._id || rowToDelete;
      
      // Send delete request to backend
      await axios.post(
        `${API_BASE_URL}/api/material-inquiry/delete-material`, 
        { id: idToDelete, email: user.email }, 
        { withCredentials: true }
      );
      
      // After successful deletion, refresh the data
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/material-inquiry/get-data`, 
          {"email": user.email}, 
          {withCredentials: true}
        );
        
        // Update both table data states with fresh data
        setTableData(response.data.data);
        setFilteredData(response.data.data);
        
        toast({
          title: "Row deleted",
          description: "The row has been successfully deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (fetchError) {
        console.error("Error fetching updated data:", fetchError);
        
        // If refresh fails, fall back to optimistic update
        const updatedTableData = tableData.filter((row) => row.id !== rowToDelete);
        setTableData(updatedTableData);
        setFilteredData(filteredData.filter((row) => row.id !== rowToDelete));
        
        toast({
          title: "Row deleted",
          description: "The row has been deleted, but the table might not reflect all current data",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete the row.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setRowToDelete(null);
    }
  };

  const handleSaveRow = async () => {
    const currentDateTime = new Date().toISOString().slice(0, -8);
    
    try {
      // Find the original row if we're editing
      let originalRow = null;
      if (selectedRowId) {
        originalRow = tableData.find(row => row.id === selectedRowId || row._id === selectedRowId);
        
        if (!originalRow) {
          throw new Error("Row not found for update");
        }
      }
      
      // Create a properly formatted object for the backend
      const backendRow = {
        // Use MongoDB _id if available, otherwise use id
        ...(originalRow && { id: originalRow._id || originalRow.id }),
        // Map frontend field names to backend field names
        supplierMaterial: newRow.supplierMaterial,
        supplementOrderNumber: newRow.supplementOrderNumber,
        status: newRow.status,
        explanation: newRow.explanation,
        createTime: selectedRowId ? undefined : currentDateTime, // Only set for new rows
        updateTime: currentDateTime,
        // For tracking updates
        updatedBy: user.email // Add this field to track who updated
      };
      
      console.log("Sending to backend:", backendRow); // Debug log
      
      // Then attempt to sync with backend
      const response = await axios.post(
        `${API_BASE_URL}/api/material-inquiry/add-material`,
        [backendRow, { user: user.email }],
        { withCredentials: true }
      );
      
      console.log("Response from backend:", response.data); // Debug log
      
      // After successful API call, refresh data from backend to ensure consistency
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/api/material-inquiry/get-data`, 
        {"email": user.email}, 
        {withCredentials: true}
      );
      
      // Set the updated data
      setTableData(refreshResponse.data.data);
      setFilteredData(refreshResponse.data.data);
      
      toast({
        title: selectedRowId ? "Row updated" : "Row added",
        description: selectedRowId 
          ? "The row has been successfully updated" 
          : "A new row has been successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving row:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save changes to the database.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsModalOpen(false);
      setSelectedRowId(null);
      setNewRow({
        supplierMaterial: "",
        supplementOrderNumber: "",
        status: "",
        explanation: "",
        createTime: "",
        updateTime: "",
      });
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => {
    // Check if user is admin or client and redirect accordingly
    if (user.role === "admin") {
      navigate.push("/admin/tables");
    } else {
      // For client users, redirect to a client-specific view
      navigate.push("/client/tables");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredData(tableData);
      return;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    if (country === "All") {
      // Search in all columns
      const filteredData = tableData.filter((row) => {
        const searchableValues = [
          row.Suppliermaterial || row.supplierMaterial,
          row.OrderNumber || row.supplementOrderNumber,
          row.status,
          row.explaination || row.explanation,
          row.createdTime || row.createTime,
          row.updateTime
        ];
        
        return searchableValues.some(
          value => value && 
          typeof value === 'string' && 
          value.toLowerCase().includes(lowercasedSearchTerm)
        );
      });
      
      setFilteredData(filteredData);
    } else {
      // Search in specific column
      const filteredData = tableData.filter((row) => {
        switch (country) {
          case "Supplier Material":
            const supplierMaterial = row.Suppliermaterial || row.supplierMaterial;
            return supplierMaterial && supplierMaterial.toLowerCase().includes(lowercasedSearchTerm);
          case "Supplement Order Number":
            const orderNumber = row.OrderNumber || row.supplementOrderNumber;
            return orderNumber && orderNumber.toLowerCase().includes(lowercasedSearchTerm);
          case "Status":
            return row.status && row.status.toLowerCase().includes(lowercasedSearchTerm);
          case "Explanation":
            const explanation = row.explaination || row.explanation;
            return explanation && explanation.toLowerCase().includes(lowercasedSearchTerm);
          case "Create Time":
            const createTime = row.createdTime || row.createTime;
            return createTime && createTime.toLowerCase().includes(lowercasedSearchTerm);
          case "Update Time":
            return row.updateTime && row.updateTime.toLowerCase().includes(lowercasedSearchTerm);
          default:
            return true;
        }
      });
      
      setFilteredData(filteredData);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData);
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    let colorScheme;
    switch (status) {
      case "Active":
        colorScheme = "green";
        break;
      case "Inactive":
        colorScheme = "red";
        break;
      case "Pending":
        colorScheme = "yellow";
        break;
      default:
        colorScheme = "gray";
    }
    return <Badge colorScheme={colorScheme}>{status}</Badge>;
  };

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Material Inquiry</Text>
            <Text fontSize="md" color="gray.400">Manage Material Inquiry</Text>
          </Flex>
          <Flex direction="row" gap={2}>
            <Button size="sm" onClick={handleViewAllClick} mr={2}>View All</Button>
            {isAdmin && (
              <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<CogIcon style={{ width: "16px", height: "16px" }} />}>
                  Table Options
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={openHeaderModal}>Manage Columns</MenuItem>
                </MenuList>
              </Menu>
            )}
            <Button size="sm" colorScheme="blue" leftIcon={<UserPlusIcon style={{ height: "16px", width: "16px" }} />} onClick={handleAddRow}>
              Add Row
            </Button>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4}>
          <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>{label}</Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex>
            <Select value={country} onChange={e => setCountry(e.target.value)} placeholder="" width={40} mr={4}>
              <option value="All">All</option>
              <option value="Supplier Material">Supplier Material</option>
              <option value="Supplement Order Number">Supplement Order Number</option>
              <option value="Status">Status</option>
              <option value="Explanation">Explanation</option>
              <option value="Create Time">Create Time</option>
              <option value="Update Time">Update Time</option>
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
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px green.500",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </InputGroup>
            </FormControl>
            <Button colorScheme="blue" mr={4} onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </Flex>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" borderRadius="10px" overflow="hidden">
            <Thead bg="gray.100" height="60px"  top={0} zIndex={10}>
              <Tr>
                {tableHeaders
                  .filter(header => header.visible)
                  .map(header => (
                    <Th key={header.id} color="gray.400">{header.label}</Th>
                  ))}
                <Th color="gray.400">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
  {filteredData.map((row) => (
    <Tr key={row._id || row.id}>
      {tableHeaders
        .filter(header => header.visible)
        .map(header => {
          if (header.id === "status") {
            return (
              <Td key={header.id}>
                {getStatusBadge(row[header.id] || row[header.altKey] || "")}
              </Td>
            );
          }
          return (
            <Td key={header.id}>
              {header.altKey 
                ? (row[header.id] || row[header.altKey] || "") 
                : (row[header.id] || "")}
            </Td>
          );
        })}
      <Td>
        <HStack spacing={2}>
          <Tooltip label="View Details">
            <IconButton
              variant="outline"
              aria-label="View Details"
              icon={<EyeIcon style={{ height: "16px", width: "16px" }} />}
              size="xs"
              onClick={() => handleViewDetails(row)}
            />
          </Tooltip>
          <Tooltip label="Edit">
            <IconButton
              variant="outline"
              aria-label="Edit"
              icon={<PencilIcon style={{ height: "16px", width: "16px" }} />}
              size="xs"
              onClick={() => handleEditRow(row._id || row.id)}
            />
          </Tooltip>
          <Tooltip label="Delete">
            <IconButton
              variant="outline"
              colorScheme="red"
              aria-label="Delete"
              icon={<TrashIcon style={{ height: "16px", width: "16px" }} />}
              size="xs"
              onClick={() => handleDeleteRow(row._id || row.id)}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  ))}
</Tbody>
          </Table>
        </Box>

        {filteredData.length === 0 && (
          <Flex justify="center" align="center" my={8}>
            <Text color="gray.500">No data found</Text>
          </Flex>
        )}

        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="sm">Page {currentPage} of 1</Text>
          <Flex>
            <Button size="sm" variant="outline" mr={2} isDisabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</Button>
            <Button size="sm" variant="outline" isDisabled>Next</Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Row" : "Add New Row"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplier Material</FormLabel>
              <Input
                value={newRow.supplierMaterial}
                onChange={(e) => setNewRow({ ...newRow, supplierMaterial: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplement Order Number</FormLabel>
              <Input
                value={newRow.supplementOrderNumber}
                onChange={(e) => setNewRow({ ...newRow, supplementOrderNumber: e.target.value })}
              />
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Status</FormLabel>
              <Select
                value={newRow.status}
                onChange={(e) => setNewRow({ ...newRow, status: e.target.value })}
                placeholder="Select status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </Select>
            </FormControl>
            <FormControl width="100%" mt={4}>
              <FormLabel>Explanation</FormLabel>
              <Input
                value={newRow.explanation}
                onChange={(e) => setNewRow({ ...newRow, explanation: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
              {selectedRowId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Material Inquiry Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMaterialDetails && (
              <Stack spacing={4}>
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Text fontWeight="bold" mb={2}>Entry Information</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created by:</Text>
                    <Text>{selectedMaterialDetails.user || "Unknown"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created on:</Text>
                    <Text>
                      {selectedMaterialDetails.createdTime || selectedMaterialDetails.createdAt
                        ? new Date(selectedMaterialDetails.createdTime || selectedMaterialDetails.createdAt).toLocaleString()
                        : "Unknown date"}
                    </Text>
                  </Flex>
                </Box>
                
                {(selectedMaterialDetails.updateTime || selectedMaterialDetails.updatedAt) && selectedMaterialDetails.updatedBy && (
                  <Box borderWidth="1px" borderRadius="lg" p={4} bg="blue.50">
                    <Text fontWeight="bold" mb={2}>Last Update</Text>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated by:</Text>
                      <Text>{selectedMaterialDetails.updatedBy}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated on:</Text>
                      <Text>
                        {new Date(selectedMaterialDetails.updateTime || selectedMaterialDetails.updatedAt).toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>
                )}

                <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
                  <Text fontWeight="bold" mb={2}>Material Details</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Supplier Material:</Text>
                    <Text>{selectedMaterialDetails.Suppliermaterial || selectedMaterialDetails.supplierMaterial || "-"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Order Number:</Text>
                    <Text>{selectedMaterialDetails.OrderNumber || selectedMaterialDetails.supplementOrderNumber || "-"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Status:</Text>
                    <Text>{getStatusBadge(selectedMaterialDetails.status)}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Explanation:</Text>
                    <Text>{selectedMaterialDetails.explaination || selectedMaterialDetails.explanation || "-"}</Text>
                  </Flex>
                </Box>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Row
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this row? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Table Header Management Modal */}
      <Modal isOpen={isHeaderModalOpen} onClose={() => setIsHeaderModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Table Columns</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify="space-between" mb={4}>
              <Text>Configure which columns are visible and their order</Text>
              <Flex gap={2}>
                {isAdmin && (
                  <Button size="sm" colorScheme="green" onClick={handleAddHeader}>
                    Add New Column
                  </Button>
                )}
                <Button size="sm" colorScheme="blue" variant="outline" onClick={resetHeadersToDefault}>
                  Reset to Default
                </Button>
              </Flex>
            </Flex>
            
            <Box maxHeight="400px" overflow="auto">
              {tempHeaders.map((header, index) => (
                <Flex 
                  key={header.id} 
                  p={3} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  mb={2}
                  align="center"
                  bg={index % 2 === 0 ? "gray.50" : "white"}
                >
                  <Flex flex={1} align="center">
                    <IconButton
                      icon={<HamburgerIcon />}
                      size="sm"
                      variant="ghost"
                      mr={2}
                      cursor="grab"
                    />
                    
                    {editingHeader === index ? (
                      <InputGroup size="sm" flex={1} mr={2}>
                        <Input 
                          value={newHeaderName} 
                          onChange={(e) => setNewHeaderName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveHeaderLabel()}
                        />
                        <Button size="sm" ml={2} onClick={saveHeaderLabel}>Save</Button>
                      </InputGroup>
                    ) : (
                      <Text flex={1}>{header.label}</Text>
                    )}
                  </Flex>

                  <Flex>
                    <IconButton
                      icon={<PencilIcon style={{ width: "14px", height: "14px" }} />}
                      size="sm"
                      variant="ghost"
                      mr={2}
                      onClick={() => handleEditHeaderLabel(index)}
                    />
                    
                    {isAdmin ? (
                      <IconButton
                        icon={<TrashIcon style={{ width: "14px", height: "14px" }} />}
                        size="sm"
                        variant="ghost"
                        mr={2}
                        onClick={() => deleteHeader(index)}
                        colorScheme="red"
                      />
                    ) : (
                      <IconButton
                        icon={<TrashIcon style={{ width: "14px", height: "14px" }} />}
                        size="sm"
                        variant="ghost"
                        mr={2}
                        isDisabled={true}
                        title="Only admins can delete columns"
                      />
                    )}

                    <Flex alignItems="center" justifyContent="space-between" width="100px">
                      <IconButton
                        aria-label="Move up"
                        icon={<Text>↑</Text>}
                        size="sm"
                        variant="ghost"
                        isDisabled={index === 0}
                        onClick={() => moveHeader(index, -1)}
                      />
                      <IconButton
                        aria-label="Move down"
                        icon={<Text>↓</Text>}
                        size="sm"
                        variant="ghost"
                        isDisabled={index === tempHeaders.length - 1}
                        onClick={() => moveHeader(index, 1)}
                      />
                    </Flex>

                    <Switch 
                      isChecked={header.visible} 
                      onChange={() => handleHeaderVisibilityChange(index)}
                      ml={4}
                    />
                  </Flex>
                </Flex>
              ))}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveHeaderChanges}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsHeaderModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add New Header Modal */}
      <Modal isOpen={isAddHeaderModalOpen} onClose={() => setIsAddHeaderModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Column</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Column ID</FormLabel>
              <Input 
                value={newHeaderInfo.id}
                onChange={(e) => setNewHeaderInfo({...newHeaderInfo, id: e.target.value})}
                placeholder="e.g. contactPerson (camelCase)"
              />
            </FormControl>
            
            <FormControl isRequired mb={3}>
              <FormLabel>Column Label</FormLabel>
              <Input 
                value={newHeaderInfo.label}
                onChange={(e) => setNewHeaderInfo({...newHeaderInfo, label: e.target.value})}
                placeholder="e.g. Contact Person"
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Alternative Key (Optional)</FormLabel>
              <Input 
                value={newHeaderInfo.altKey || ""}
                onChange={(e) => setNewHeaderInfo({...newHeaderInfo, altKey: e.target.value})}
                placeholder="For backwards compatibility"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Use this if data might be stored under a different key name
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveNewHeader}>
              Add Column
            </Button>
            <Button variant="ghost" onClick={() => setIsAddHeaderModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MaterialInquiry;