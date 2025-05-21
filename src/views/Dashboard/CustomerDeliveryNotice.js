import React, { useState, useRef, useEffect } from "react";
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon, CogIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Backend API URL
const API_URL = "https://globalindiabackendnew.onrender.com";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

// Default table headers configuration for Customer Delivery Notice
const DEFAULT_HEADERS = [
  { id: "OrderNumber", label: "Order Number", visible: true },
  { id: "MaterialCategory", label: "Material Category", visible: true },
  { id: "Vendor", label: "Vendor", visible: true },
  { id: "Invitee", label: "Invitee", visible: true },
  { id: "HostInviterContactInfo", label: "Host/Inviter Contact Info", visible: true },
  { id: "Sender", label: "Sender", visible: true },
  { id: "Status", label: "Status", visible: true },
  { id: "SupplementTemplate", label: "Supplement Template", visible: true },
  { id: "Created", label: "Created", visible: true },
  { id: "Actions", label: "Actions", visible: true },
];

const CustomerDeliveryNotice = () => {
  const [tableData, setTableData] = useState([]);
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
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"))
  
  // Correct initialization of newRow state with default Status
  const [newRow, setNewRow] = useState({
    OrderNumber: "",
    MaterialCategory: "",
    Vendor: "",
    Invitee: "",
    HostInviterContactInfo: "",
    Sender: "",
    Status: "Pending", // Default status
    SupplementTemplate: "",
    Created: new Date().toISOString().split('T')[0],
  });
  
  const [selectedRowId, setSelectedRowId] = useState(null);
  const searchInputRef = useRef(null);
  const cancelRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${API_URL}/api/customer-delivery-notices/get-data`, {"email": user.email}, {
          withCredentials: true,
        });

        // Process the data to ensure we have both _id and id fields
        const processedData = response.data.data.map((item, index) => ({
          ...item,
          id: index + 1, // Frontend display ID
          // Make sure _id is preserved for backend operations
        }));

        setTableData(processedData);
        setFilteredData(processedData);
        
        // Check if user is admin
        setIsAdmin(user.role === "admin");
        
        // Fetch headers configuration
        try {
          const headerResponse = await axios.get(
            `${API_URL}/api/table-headers/get-customer-delivery?email=${user.email}`, 
            { withCredentials: true }
          );
          
          if (headerResponse.data.headers) {
            setTableHeaders(headerResponse.data.headers);
          } else {
            setTableHeaders(DEFAULT_HEADERS);
          }
        } catch (headerError) {
          console.error("Error fetching table headers:", headerError);
          // Fallback to default or localStorage headers
          const savedHeaders = localStorage.getItem('customerDeliveryNoticeHeaders');
          if (savedHeaders) {
            try {
              setTableHeaders(JSON.parse(savedHeaders));
            } catch (e) {
              console.error("Error loading saved headers:", e);
              setTableHeaders(DEFAULT_HEADERS);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();

    if (searchInputRef.current) {
      setIsFocused(searchInputRef.current === document.activeElement);
    }
  }, []);

  // Effect to save header configuration when it changes
  useEffect(() => {
    localStorage.setItem('customerDeliveryNoticeHeaders', JSON.stringify(tableHeaders));
  }, [tableHeaders]);

  // Effect for search filtering
  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
    setNewRow({
      OrderNumber: "",
      MaterialCategory: "",
      Vendor: "",
      Invitee: "",
      HostInviterContactInfo: "",
      Sender: "",
      Status: "Pending", // Always set default
      SupplementTemplate: "",
      Created: new Date().toISOString().split('T')[0],
    });
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row.id === rowId);
    if (selectedRow) {
      setNewRow({
        OrderNumber: selectedRow.OrderNumber,
        MaterialCategory: selectedRow.MaterialCategory,
        Vendor: selectedRow.Vendor,
        Invitee: selectedRow.Invitee,
        HostInviterContactInfo: selectedRow.HostInviterContactInfo,
        Sender: selectedRow.Sender,
        Status: selectedRow.Status || "Pending", // Fallback to "Pending" if empty
        SupplementTemplate: selectedRow.SupplementTemplate,
        Created: selectedRow.Created,
      });
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleViewDetails = (row) => {
    setSelectedReportDetails(row);
    setIsViewModalOpen(true);
  };

  const handleDeleteRow = (rowId) => {
    // Find the complete row data to get the MongoDB _id
    const rowToBeDeleted = tableData.find(row => row.id === rowId);
    
    if (!rowToBeDeleted) {
      toast({
        title: "Error",
        description: "Row not found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Store the MongoDB _id for deletion
    const mongoDbId = rowToBeDeleted._id;
    console.log("Setting row to delete with MongoDB ID:", mongoDbId);
    
    setRowToDelete(mongoDbId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Attempting to delete notice with ID:", rowToDelete);
      
      // Delete from backend
      const response = await axios.delete(`${API_URL}/api/customer-delivery-notices/${rowToDelete}`, {
        withCredentials: true,
        data: { user: user.email }
      });
      
      console.log("Delete response:", response.data);
      
      // Find the frontend ID that corresponds to this MongoDB _id
      const rowToRemove = tableData.find(row => row._id === rowToDelete);
      if (!rowToRemove) {
        throw new Error("Could not find the row to delete in the UI");
      }
      
      // Update the UI using the frontend ID
      const updatedTableData = tableData.filter((row) => row._id !== rowToDelete);
      setTableData(updatedTableData);
      setFilteredData(updatedTableData.filter((row) => filterRow(row)));
      
      toast({
        title: "Delivery notice deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      
      // Better error message extraction
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Unknown error occurred";
      
      toast({
        title: "Error deleting delivery notice",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  };

  const handleSaveRow = async() => {
    try {
      // Validate required fields
      if (!newRow.OrderNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "Order Number is required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (!newRow.MaterialCategory.trim()) {
        toast({
          title: "Validation Error",
          description: "Material Category is required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (!newRow.Vendor.trim()) {
        toast({
          title: "Validation Error",
          description: "Vendor is required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Format the date correctly
      let formattedCreated = newRow.Created;
      
      // Check if the date is in ISO format and needs conversion
      if (newRow.Created && newRow.Created.includes('T')) {
        // Parse the ISO date and format it as YYYY-MM-DD
        const date = new Date(newRow.Created);
        formattedCreated = date.toISOString().split('T')[0];
      }
      
      // Ensure Status is not empty - use "Pending" as default if empty
      const updatedNewRow = {
        ...newRow,
        Status: newRow.Status || "Pending",
        Created: formattedCreated
      };
      
      if (selectedRowId) {
        // Find the actual MongoDB _id that corresponds to the selectedRowId
        const selectedRow = tableData.find(row => row.id === selectedRowId);
        if (!selectedRow || !selectedRow._id) {
          throw new Error("Could not find the row to update");
        }

        // Use the MongoDB _id for the API call
        const mongoDbId = selectedRow._id;
        console.log("Updating notice with MongoDB ID:", mongoDbId);
        
        // Update frontend state first for immediate UI feedback
        const updatedTableData = tableData.map((row) =>
          row.id === selectedRowId ? { 
            ...row, 
            OrderNumber: updatedNewRow.OrderNumber,
            MaterialCategory: updatedNewRow.MaterialCategory,
            Vendor: updatedNewRow.Vendor,
            Invitee: updatedNewRow.Invitee,
            HostInviterContactInfo: updatedNewRow.HostInviterContactInfo,
            Sender: updatedNewRow.Sender,
            Status: updatedNewRow.Status,
            SupplementTemplate: updatedNewRow.SupplementTemplate,
            Created: updatedNewRow.Created,
            updatedAt: new Date(),
            updatedBy: user.email
          } : row
        );
        
        setTableData(updatedTableData);
        setFilteredData(updatedTableData.filter((row) => filterRow(row)));
        
        // Call the backend update API
        try {
          const response = await axios.put(
            `${API_URL}/api/customer-delivery-notices/${mongoDbId}`, 
            {
              data: updatedNewRow,
              user: user.email
            }, 
            { withCredentials: true }
          );
          
          toast({
            title: "Delivery notice updated successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } catch (updateError) {
          console.error("Backend update error:", updateError);
          toast({
            title: "Warning: Local update only",
            description: "The update was made in the UI but couldn't be saved to the database. Please try again later.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        // Add new row
        const response = await axios.post(`${API_URL}/api/customer-delivery-notices/add`, 
          [
            updatedNewRow,
            { user: user.email }
          ], 
          { withCredentials: true }
        );
        
        // Add the new row with the correct MongoDB _id
        const newRowWithId = { 
          ...updatedNewRow, 
          _id: response.data.data._id,
          id: tableData.length + 1,
          user: user.email,
          createdAt: new Date()
        };
        
        const newTableData = [...tableData, newRowWithId];
        setTableData(newTableData);
        setFilteredData(newTableData.filter((row) => filterRow(row)));
        
        toast({
          title: "Delivery notice added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      setIsModalOpen(false);
      setNewRow({
        OrderNumber: "",
        MaterialCategory: "",
        Vendor: "",
        Invitee: "",
        HostInviterContactInfo: "",
        Sender: "",
        Status: "Pending", // Default value
        SupplementTemplate: "",
        Created: new Date().toISOString().split('T')[0],
      });
      setSelectedRowId(null);
      
    } catch (err) {
      console.error("Error saving delivery notice:", err);
      
      // Improved error reporting
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      console.log("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: errorMsg,
        data: err.response?.data
      });
      
      toast({
        title: "Error saving delivery notice",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const navigate = useHistory();
  const handleViewAllClick = () => {
    if (user.role === "admin") {
      navigate.push("/admin/tables");
    } else {
      navigate.push("/client/tables");
    }
  };

  const filterRow = (row) => {
    if (searchTerm === "") return true;
    
    if (country === "All") {
      return tableHeaders.some(header => {
        if (!header.visible) return false;
        const value = row[header.id] || "";
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return value.toString().includes(searchTerm);
        }
      });
    } else {
      const header = tableHeaders.find(h => h.label === country);
      if (!header) return true;
      
      const value = row[header.id] || "";
      
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return value.toString().includes(searchTerm);
      }
    }
  };

  const handleSearch = () => {
    const filtered = tableData.filter(filterRow);
    setFilteredData(filtered);
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData);
  };

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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userEmail = user?.email;
      
      // Prepare the request data
      const requestData = {
        headers: tempHeaders,
        email: userEmail,
        isGlobal: isAdmin // Only admins can update global headers
      };
      
      // Add headers with authorization token
      const config = {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(
        `${API_URL}/api/table-headers/update-customer-delivery`,
        requestData,
        config
      );
      
      if (response.data.success) {
        setTableHeaders(tempHeaders);
        setIsHeaderModalOpen(false);
        toast({
          title: "Success!",
          description: isAdmin ? "Global header settings saved successfully!" : "Your header settings saved successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving header changes:", error);
      let errorMessage = "Failed to save header settings";
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Bad request - please check your input";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to perform this action";
        } else if (error.response.status === 409) {
          errorMessage = "A conflict occurred while saving. Please try again.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error - please try again later";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
    
    const newHeader = {
      id: newHeaderInfo.id,
      label: newHeaderInfo.label,
      visible: true,
      altKey: newHeaderInfo.altKey || null
    };
    
    setTempHeaders([...tempHeaders, newHeader]);
    setIsAddHeaderModalOpen(false);
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

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Customer Delivery Notice</Text>
            <Text fontSize="md" color="gray.400">Manage Customer Delivery Notices</Text>
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
            <Button size="sm" colorScheme="blue" leftIcon={<UserPlusIcon style={{ width: "16px", height: "16px" }} />} onClick={handleAddRow}>
              Add Row
            </Button>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4} flexDirection={{ base: "column", md: "row" }} gap={4}>
          <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>{label}</Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex flexWrap="wrap" gap={2}>
            <Select value={country} onChange={e => setCountry(e.target.value)} placeholder="" width={{ base: "full", md: "40" }}>
              <option value="All">All</option>
              {tableHeaders.filter(header => header.visible).map(header => (
                <option key={header.id} value={header.label}>{header.label}</option>
              ))}
            </Select>
            <FormControl width={{ base: "full", md: "64" }}>
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
                />
              </InputGroup>
            </FormControl>
            <Button colorScheme="blue" onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleClear}>Clear</Button>
          </Flex>
        </Flex>

        <Box overflowX="auto" overflowY="auto" maxHeight="70vh">
          <Table variant="simple" borderRadius="10px" overflow="hidden">
            <Thead bg="gray.100" height="60px" top={0} zIndex={10}>
              <Tr>
                {tableHeaders
                  .filter(header => header.visible)
                  .map(header => (
                    <Th key={header.id} color="gray.400">{header.label}</Th>
                  ))}
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => (
                      <Td key={header.id}>
                        {header.id === "Actions" ? (
                          <Flex gap={2}>
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
                                icon={<PencilIcon style={{ width: "14px", height: "14px" }} />}
                                size="xs"
                                onClick={() => handleEditRow(row.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                variant="outline"
                                colorScheme="red"
                                aria-label="Delete"
                                icon={<TrashIcon style={{ width: "14px", height: "14px" }} />}
                                size="xs"
                                onClick={() => handleDeleteRow(row.id)}
                              />
                            </Tooltip>
                          </Flex>
                        ) : (
                          row[header.id] || ""
                        )}
                      </Td>
                    ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="sm">Page {currentPage} of 1</Text>
          <Flex>
            <Button size="sm" variant="outline" mr={2} isDisabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</Button>
            <Button size="sm" variant="outline" isDisabled>Next</Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Delivery Notice" : "Add New Delivery Notice"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl width="100%" mt={4} isRequired>
              <FormLabel>Order Number</FormLabel>
              <Input
                value={newRow.OrderNumber || ""}
                onChange={(e) => setNewRow({ ...newRow, OrderNumber: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4} isRequired>
              <FormLabel>Material Category</FormLabel>
              <Input
                value={newRow.MaterialCategory || ""}
                onChange={(e) => setNewRow({ ...newRow, MaterialCategory: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4} isRequired>
              <FormLabel>Vendor</FormLabel>
              <Input
                value={newRow.Vendor || ""}
                onChange={(e) => setNewRow({ ...newRow, Vendor: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4}>
              <FormLabel>Invitee</FormLabel>
              <Input
                value={newRow.Invitee || ""}
                onChange={(e) => setNewRow({ ...newRow, Invitee: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4}>
              <FormLabel>Host/Inviter Contact Info</FormLabel>
              <Input
                value={newRow.HostInviterContactInfo || ""}
                onChange={(e) => setNewRow({ ...newRow, HostInviterContactInfo: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4}>
              <FormLabel>Sender</FormLabel>
              <Input
                value={newRow.Sender || ""}
                onChange={(e) => setNewRow({ ...newRow, Sender: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4}>
              <FormLabel>Status</FormLabel>
              <Select
                value={newRow.Status || "Pending"}
                onChange={(e) => setNewRow({ ...newRow, Status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </FormControl>
            
            <FormControl width="100%" mt={4}>
              <FormLabel>Supplement Template</FormLabel>
              <Input
                value={newRow.SupplementTemplate || ""}
                onChange={(e) => setNewRow({ ...newRow, SupplementTemplate: e.target.value })}
              />
            </FormControl>
            
            <FormControl width="100%" mt={4}>
              <FormLabel>Created</FormLabel>
              <Input
                type="date"
                value={newRow.Created ? (newRow.Created.includes('T') ? 
                  new Date(newRow.Created).toISOString().split('T')[0] : 
                  newRow.Created) : ""}
                onChange={(e) => setNewRow({ ...newRow, Created: e.target.value })}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Delivery Notice
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this delivery notice? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delivery Notice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReportDetails && (
              <Stack spacing={4}>
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Text fontWeight="bold" mb={2}>Entry Information</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created by:</Text>
                    <Text>{selectedReportDetails.user || "Unknown"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created on:</Text>
                    <Text>
                      {selectedReportDetails.createdAt 
                        ? new Date(selectedReportDetails.createdAt).toLocaleString() 
                        : "Unknown date"}
                    </Text>
                  </Flex>
                </Box>
                
                {selectedReportDetails.updatedAt && selectedReportDetails.updatedBy && (
                  <Box borderWidth="1px" borderRadius="lg" p={4} bg="blue.50">
                    <Text fontWeight="bold" mb={2}>Last Update</Text>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated by:</Text>
                      <Text>{selectedReportDetails.updatedBy}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated on:</Text>
                      <Text>{new Date(selectedReportDetails.updatedAt).toLocaleString()}</Text>
                    </Flex>
                  </Box>
                )}
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

export default CustomerDeliveryNotice;