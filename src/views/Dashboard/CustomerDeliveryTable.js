import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  IconButton,
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Stack,
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import { PencilIcon, TrashIcon, UserPlusIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";

// Default table headers configuration
const DEFAULT_HEADERS = [
  { id: "OrderNumber", label: "Order Number" },
  { id: "MaterialCategory", label: "Material Category" },
  { id: "Vendor", label: "Vendor" },
  { id: "Invitee", label: "Invitee" },
  { id: "HostInviterContactInfo", label: "Host/Inviter Contact Info" },
  { id: "Sender", label: "Sender" },
  { id: "Status", label: "Status" },
  { id: "SupplementTemplate", label: "Supplement Template" },
  { id: "Created", label: "Created" },
];

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Delivered":
      colorScheme = "green";
      break;
    case "Pending":
      colorScheme = "yellow";
      break;
    case "Cancelled":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const CustomerDeliveryTable = ({ 
  apiUrl = "https://globalindiabackendnew.onrender.com/api"
}) => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newRow, setNewRow] = useState({
    OrderNumber: "",
    MaterialCategory: "",
    Vendor: "",
    Invitee: "",
    HostInviterContactInfo: "",
    Sender: "",
    Status: "Pending",
    SupplementTemplate: "",
    Created: new Date().toISOString().split('T')[0],
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedNoticeDetails, setSelectedNoticeDetails] = useState(null);
  
  const toast = useToast();
  const history = useHistory();
  const [rowToDelete, setRowToDelete] = useState(null);

  // Modal state management
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  const { 
    isOpen: isModalOpen, 
    onOpen: onModalOpen, 
    onClose: onModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isViewModalOpen, 
    onOpen: onViewModalOpen, 
    onClose: onViewModalClose 
  } = useDisclosure();

  const cancelRef = useRef();

  // Fetch current user data from local/session storage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
    setIsAdmin(user?.role === "admin");
  }, []);

  // Fetch notice data
  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(`${apiUrl}/customer-delivery-notices/get-data`, 
          { email: currentUser?.email },
          { withCredentials: true }
        );
        
        if (response.data && Array.isArray(response.data.data)) {
          const dataWithId = response.data.data.map(item => ({
            ...item,
            id: item._id
          }));
          setNotices(dataWithId);
          setFilteredNotices(dataWithId);
          setError(null);
        } else {
          console.error("Invalid data format received from server");
          toast({
            title: "Data error",
            description: "Received invalid data format from server",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast({
          title: "Error fetching data",
          description: err.response?.data?.message || err.message || "Failed to fetch data from server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchNotices();
    }
  }, [apiUrl, toast, currentUser]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = notices;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(notice => 
        (notice.OrderNumber || "").toString().toLowerCase().includes(term) ||
        (notice.MaterialCategory || "").toLowerCase().includes(term) ||
        (notice.Vendor || "").toLowerCase().includes(term) ||
        (notice.Invitee || "").toLowerCase().includes(term)
      );
    }
    
    if (filterStatus !== "All") {
      results = results.filter(notice => notice.Status === filterStatus);
    }
    
    setFilteredNotices(results);
  }, [searchTerm, filterStatus, notices]);

  // Handle view details
  const handleViewDetails = (row) => {
    setSelectedNoticeDetails(row);
    onViewModalOpen();
  };

  // Handle add new row
  const handleAddRow = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to add data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onModalOpen();
    setSelectedRowId(null);
    setNewRow({
      OrderNumber: "",
      MaterialCategory: "",
      Vendor: "",
      Invitee: "",
      HostInviterContactInfo: "",
      Sender: "",
      Status: "Pending",
      SupplementTemplate: "",
      Created: new Date().toISOString().split('T')[0],
    });
  };

  // Handle edit row
  const handleEditRow = (rowId) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to edit data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const selectedRow = notices.find((row) => row.id === rowId || row._id === rowId);
    if (selectedRow) {
      setNewRow({...selectedRow});
      setSelectedRowId(rowId);
      onModalOpen();
    }
  };

  // Handle save row
  const handleSaveRow = async() => {
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("User authentication required");
      }

      // Validate required fields
      if (!newRow.OrderNumber.trim()) {
        throw new Error("Order Number is required");
      }
      
      if (!newRow.MaterialCategory.trim()) {
        throw new Error("Material Category is required");
      }
      
      if (!newRow.Vendor.trim()) {
        throw new Error("Vendor is required");
      }
      
      // Format Created date properly if it's an ISO string
      const formattedCreated = newRow.Created && typeof newRow.Created === 'string' && newRow.Created.includes('T') 
        ? newRow.Created.split('T')[0] 
        : newRow.Created;

      if (selectedRowId) {
        // For updates we need to structure the request correctly
        const idForUpdate = newRow._id || selectedRowId;
        
        // Create the update data object with all required fields
        const updateData = { 
          OrderNumber: newRow.OrderNumber,
          MaterialCategory: newRow.MaterialCategory,
          Vendor: newRow.Vendor,
          Invitee: newRow.Invitee || "",
          HostInviterContactInfo: newRow.HostInviterContactInfo || "",
          Sender: newRow.Sender || "",
          Status: newRow.Status || "Pending",
          SupplementTemplate: newRow.SupplementTemplate || "",
          Created: formattedCreated,
          updatedAt: new Date(),
          updatedBy: currentUser.email
        };
        
        // Match the API request format from the backend route
        await axios.put(`${apiUrl}/customer-delivery-notices/${idForUpdate}`, 
          {
            data: updateData,
            user: currentUser.email
          },
          { withCredentials: true }
        );
        
      } else {
        // For new records
        const dataToSend = {
          OrderNumber: newRow.OrderNumber,
          MaterialCategory: newRow.MaterialCategory,
          Vendor: newRow.Vendor,
          Invitee: newRow.Invitee || "",
          HostInviterContactInfo: newRow.HostInviterContactInfo || "",
          Sender: newRow.Sender || "",
          Status: newRow.Status || "Pending",
          SupplementTemplate: newRow.SupplementTemplate || "",
          Created: formattedCreated,
          user: currentUser.email,
          createdAt: new Date()
        };
        
        await axios.post(`${apiUrl}/customer-delivery-notices/add`,
          [dataToSend, { user: currentUser.email }],
          { withCredentials: true }
        );
      }
        
      // Refresh the data after successful save
      const response = await axios.post(`${apiUrl}/customer-delivery-notices/get-data`,
        { email: currentUser.email },
        { withCredentials: true }
      );
      
      const dataWithId = response.data.data.map(item => ({
        ...item,
        id: item._id
      }));
      
      setNotices(dataWithId);
      setFilteredNotices(dataWithId);
      
      onModalClose();
      setSelectedRowId(null);
      toast({
        title: "Success",
        description: selectedRowId ? "Notice updated successfully" : "Notice added successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
    } catch(err) {
      console.error("Error saving data:", err);
      toast({
        title: "Error saving data",
        description: err.response?.data?.message || err.message || "Failed to save data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleDeleteClick = (rowId) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to delete data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const row = notices.find(r => r.id === rowId || r._id === rowId);
    setRowToDelete(row._id || row.id);
    onDeleteOpen();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("User authentication required");
      }
      
      await axios.delete(`${apiUrl}/customer-delivery-notices/${rowToDelete}`, 
        { 
          withCredentials: true,
          data: { user: currentUser.email }
        }
      );
      
      const response = await axios.post(`${apiUrl}/customer-delivery-notices/get-data`,
        { email: currentUser.email },
        { withCredentials: true }
      );
      
      if (response.data && Array.isArray(response.data.data)) {
        const dataWithId = response.data.data.map(item => ({
          ...item,
          id: item._id
        }));
        setNotices(dataWithId);
        setFilteredNotices(dataWithId);
      }
      
      setRowToDelete(null);
      onDeleteClose();
      
      toast({
        title: "Success",
        description: "Delivery notice deleted successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast({
        title: "Error deleting notice",
        description: error.response?.data?.message || error.message || "Failed to delete notice",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle export to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "#," + DEFAULT_HEADERS
      .map(header => header.label)
      .join(",") + "\n";
    
    filteredNotices.forEach((row, index) => {
      csvContent += `${index + 1},`;
      DEFAULT_HEADERS.forEach(header => {
        const value = row[header.id] || "";
        csvContent += `"${value.toString().replace(/"/g, '""')}",`;
      });
      csvContent += "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery-notices-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredNotices.length} delivery notices to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading delivery notices...</Text>
      </Box>
    );
  }

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
      {/* Error display */}
      {error && (
        <Alert status="error" mb={5}>
          <AlertIcon />
          <Box flex="1">
            <Text>{error}</Text>
          </Box>
        </Alert>
      )}
      
      {/* Filter controls */}
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by order number, material, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW="200px" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredNotices.length === 0}
        >
          Export CSV
        </Button>

        {isAdmin && (
          <Button 
            leftIcon={<UserPlusIcon style={{ width: "16px", height: "16px" }} />} 
            colorScheme="green"
            onClick={handleAddRow}
          >
            Add Notice
          </Button>
        )}
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredNotices.length} of {notices.length} notices
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th>#</Th>
              {DEFAULT_HEADERS.map(header => (
                <Th key={header.id}>{header.label}</Th>
              ))}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredNotices.length > 0 ? (
              filteredNotices.map((row, index) => (
                <Tr key={row._id || row.id} _hover={{ bg: "gray.50" }}>
                  <Td>{index + 1}</Td>
                  {DEFAULT_HEADERS.map(header => {
                    const value = row[header.id] || "";
                    
                    if (header.id === "Status") {
                      return (
                        <Td key={header.id}>
                          {getStatusBadge(value)}
                        </Td>
                      );
                    }
                    
                    if (header.id === "Created" && value) {
                      return (
                        <Td key={header.id}>
                          {new Date(value).toLocaleDateString()}
                        </Td>
                      );
                    }
                    
                    return (
                      <Td key={header.id}>{value || "-"}</Td>
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
                      {isAdmin && (
                        <>
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
                              onClick={() => handleDeleteClick(row._id || row.id)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={DEFAULT_HEADERS.length + 2} textAlign="center" py={4}>
                  No notices matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Delivery Notice" : "Add New Delivery Notice"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired width="100%" mt={4}>
              <FormLabel>Order Number</FormLabel>
              <Input
                value={newRow.OrderNumber || ""}
                onChange={(e) => setNewRow({ ...newRow, OrderNumber: e.target.value })}
              />
            </FormControl>
            
            <FormControl isRequired width="100%" mt={4}>
              <FormLabel>Material Category</FormLabel>
              <Input
                value={newRow.MaterialCategory || ""}
                onChange={(e) => setNewRow({ ...newRow, MaterialCategory: e.target.value })}
              />
            </FormControl>
            
            <FormControl isRequired width="100%" mt={4}>
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
              <FormLabel>Created Date</FormLabel>
              <Input
                type="date"
                value={newRow.Created || ""}
                onChange={(e) => setNewRow({ ...newRow, Created: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
              {selectedRowId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={onModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Delivery Notice
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete notice {noticeToDelete?.OrderNumber}? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delivery Notice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNoticeDetails && (
              <Stack spacing={4}>
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Text fontWeight="bold" mb={2}>Entry Information</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created by:</Text>
                    <Text>{selectedNoticeDetails.user || "Unknown"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created on:</Text>
                    <Text>
                      {selectedNoticeDetails.createdAt 
                        ? new Date(selectedNoticeDetails.createdAt).toLocaleString() 
                        : "Unknown date"}
                    </Text>
                  </Flex>
                </Box>
                
                {selectedNoticeDetails.updatedAt && selectedNoticeDetails.updatedBy && (
                  <Box borderWidth="1px" borderRadius="lg" p={4} bg="blue.50">
                    <Text fontWeight="bold" mb={2}>Last Update</Text>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated by:</Text>
                      <Text>{selectedNoticeDetails.updatedBy}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated on:</Text>
                      <Text>{new Date(selectedNoticeDetails.updatedAt).toLocaleString()}</Text>
                    </Flex>
                  </Box>
                )}
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onViewModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomerDeliveryTable;