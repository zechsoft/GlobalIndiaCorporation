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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  HStack
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import { PencilIcon, TrashIcon, UserPlusIcon, EyeIcon } from "@heroicons/react/24/solid";
import axios from "axios";

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Active":
      colorScheme = "green";
      break;
    case "Pending":
      colorScheme = "yellow";
      break;
    case "Inactive":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

// Template status badge styling helper
const getTemplateStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Complete":
      colorScheme = "green";
      break;
    case "Incomplete":
      colorScheme = "orange";
      break;
    case "Pending Review":
      colorScheme = "blue";
      break;
    case "Expired":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const MaterialReplenishmentTable = () => {
  // Base API URL for the deployed backend
  const API_BASE_URL = "https://globalindiabackendnew.onrender.com";
  
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTemplateStatus, setFilterTemplateStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(7);
  
  // Modal and dialog controls
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const cancelRef = useRef();
  
  // Row management state
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [newRow, setNewRow] = useState({
    OrderNumber: "",
    MaterialCategory: "",
    Vendor: "",
    Invitee: "",
    Host: "",
    Sender: "",
    Status: "Active",
    SupplementTemplate: "Complete",
    Created: "",
    updated: ""
  });

  // Table headers (simplified without management options)
  const tableHeaders = [
    { id: "OrderNumber", label: "Order Number" },
    { id: "MaterialCategory", label: "Material Category" },
    { id: "Vendor", label: "Vendor" },
    { id: "Invitee", label: "Invitee" },
    { id: "Host", label: "Host/Inviter Contact Information" },
    { id: "Sender", label: "Sender" },
    { id: "Status", label: "Status" },
    { id: "SupplementTemplate", label: "Supplement Template" },
    { id: "Created", label: "Create Time" },
    { id: "updated", label: "Update Time" },
  ];

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        if (!user) {
          throw new Error("User not authenticated");
        }
        setCurrentUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch material data
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/material-replenishment/get-all`, {
          withCredentials: true
        });
        
        // Map _id to id for consistency
        const dataWithIds = response.data.data.map(item => ({
          ...item,
          id: item.id
        }));
        
        setMaterials(dataWithIds);
        setFilteredMaterials(dataWithIds);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError(err.response?.data?.message || "Failed to fetch material data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch material data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (currentUser) {
      fetchMaterials();
    }
  }, [currentUser, toast, API_BASE_URL]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = materials;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(material => 
        (material.OrderNumber && material.OrderNumber.toLowerCase().includes(term)) ||
        (material.MaterialCategory && material.MaterialCategory.toLowerCase().includes(term)) ||
        (material.Vendor && material.Vendor.toLowerCase().includes(term)) ||
        (material.Invitee && material.Invitee.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(material => material.Status === filterStatus);
    }
    
    // Apply template status filter
    if (filterTemplateStatus !== "All") {
      results = results.filter(material => material.SupplementTemplate === filterTemplateStatus);
    }
    
    setFilteredMaterials(results);
  }, [searchTerm, filterStatus, filterTemplateStatus, materials]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterTemplateStatus]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredMaterials.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Row management functions
  const handleAddRow = () => {
    setSelectedRowId(null);
    setNewRow({
      OrderNumber: "",
      MaterialCategory: "",
      Vendor: "",
      Invitee: "",
      Host: "",
      Sender: "",
      Status: "Active",
      SupplementTemplate: "Complete",
      Created: new Date().toISOString(),
      updated: new Date().toISOString()
    });
    onModalOpen();
  };

  const handleEditRow = (rowId) => {
    const selectedRow = materials.find(row => row.id === rowId);
    if (selectedRow) {
      setNewRow({
        ...selectedRow,
        Created: selectedRow.Created || new Date().toISOString(),
        updated: selectedRow.updated || new Date().toISOString()
      });
      setSelectedRowId(rowId);
      onModalOpen();
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    onDeleteOpen();
  };

  const handleViewDetails = (row) => {
    // Implement view details functionality if needed
    console.log("View details for row:", row);
    toast({
      title: "View Details",
      description: `Viewing details for order ${row.OrderNumber}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSaveRow = async () => {
    try {
      const currentDateTime = new Date().toISOString();
      
      // Map the frontend data structure to match backend expectations
      const rowData = {
        orderNumber: newRow.OrderNumber || "",
        materialCategory: newRow.MaterialCategory || "",
        vendor: newRow.Vendor || "",
        invitee: newRow.Invitee || "",
        hostInviterContactInfo: newRow.Host || "",
        sender: newRow.Sender || "",
        status: newRow.Status || "Active",
        supplementTemplate: newRow.SupplementTemplate || "Complete",
        updateTime: currentDateTime
      };

      if (selectedRowId) {
        // Update existing row
        const response = await axios.post(
          `${API_BASE_URL}/api/material-replenishment/update-data`,
          { 
            id: selectedRowId,
            data: rowData, 
            email: currentUser.email 
          },
          { withCredentials: true }
        );
        
        // If update was successful, update the local state without fetching all data again
        if (response.status === 200) {
          // Create updated row with the same structure as our existing data
          const updatedRow = {
            ...newRow,
            OrderNumber: rowData.orderNumber,
            MaterialCategory: rowData.materialCategory,
            Vendor: rowData.vendor,
            Invitee: rowData.invitee,
            Host: rowData.hostInviterContactInfo,
            Sender: rowData.sender,
            Status: rowData.status,
            SupplementTemplate: rowData.supplementTemplate,
            updated: currentDateTime
          };
          
          // Update both state arrays by replacing the edited row
          setMaterials(prevMaterials => 
            prevMaterials.map(row => row.id === selectedRowId ? updatedRow : row)
          );
          
          setFilteredMaterials(prevFiltered => 
            prevFiltered.map(row => row.id === selectedRowId ? updatedRow : row)
          );
          
          toast({
            title: "Row updated",
            description: "The row has been successfully updated",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Add new row
        rowData.createTime = currentDateTime;
        await axios.post(
          `${API_BASE_URL}/api/material-replenishment/add-data`,
          [rowData, { user: currentUser.email }],
          { withCredentials: true }
        );
        
        // After adding, fetch all data to get the new row with its ID
        const response = await axios.get(`${API_BASE_URL}/api/material-replenishment/get-all`, {
          withCredentials: true
        });
        
        const dataWithIds = response.data.data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        
        setMaterials(dataWithIds);
        setFilteredMaterials(dataWithIds);
        
        toast({
          title: "Row added",
          description: "A new row has been successfully added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      onModalClose();
      setSelectedRowId(null);
    } catch (error) {
      console.error("Error saving row:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save the row",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = async () => {
    try {
      // Using the correct endpoint that exists in your backend
      await axios.post(
        `${API_BASE_URL}/api/material-replenishment/delete-data`, 
        { 
          id: rowToDelete,
          email: currentUser.email 
        }, 
        { withCredentials: true }
      );
      
      // After successful deletion, reload all data from the server
      const response = await axios.get(`${API_BASE_URL}/api/material-replenishment/get-all`, {
        withCredentials: true
      });
      
      // Map _id to id for consistency
      const dataWithIds = response.data.data.map(item => ({
        ...item,
        id: item._id || item.id // Handle both _id and id fields
      }));
      
      // Update both materials arrays with fresh data
      setMaterials(dataWithIds);
      setFilteredMaterials(dataWithIds);
      
      toast({
        title: "Row deleted",
        description: "The row has been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete the row",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
      setRowToDelete(null);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "#,Order Number,Material Category,Vendor,Invitee,Host/Inviter Contact Information,Sender,Status,Supplement Template,Create Time,Update Time\n";
    
    filteredMaterials.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `${row.OrderNumber || ""},`;
      csvContent += `"${row.MaterialCategory || ""}",`;
      csvContent += `"${row.Vendor || ""}",`;
      csvContent += `"${row.Invitee || ""}",`;
      csvContent += `"${row.Host || ""}",`;
      csvContent += `"${row.Sender || ""}",`;
      csvContent += `${row.Status || ""},`;
      csvContent += `${row.SupplementTemplate || ""},`;
      csvContent += `${row.Created ? new Date(row.Created).toLocaleString() : ""},`;
      csvContent += `${row.updated ? new Date(row.updated).toLocaleString() : ""}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `material-replenish-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredMaterials.length} material records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const isAdmin = currentUser?.role === "admin";

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading material data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
      {/* Filter controls */}
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by order number, vendor, category..."
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
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </Select>
        
        <Select 
          maxW="200px" 
          value={filterTemplateStatus} 
          onChange={(e) => setFilterTemplateStatus(e.target.value)}
        >
          <option value="All">All Templates</option>
          <option value="Complete">Complete</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Expired">Expired</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredMaterials.length === 0}
        >
          Export CSV
        </Button>

        {isAdmin && (
          <Button 
            leftIcon={<UserPlusIcon style={{ width: "16px", height: "16px" }} />} 
            colorScheme="green"
            onClick={handleAddRow}
          >
            Add Row
          </Button>
        )}
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredMaterials.length} of {materials.length} materials
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th>#</Th>
              {tableHeaders.map(header => (
                <Th key={header.id}>{header.label}</Th>
              ))}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {getPaginatedData().length > 0 ? (
              getPaginatedData().map((row, index) => (
                <Tr key={row.id} _hover={{ bg: "gray.50" }}>
                  <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                  {tableHeaders.map(header => {
                    if (header.id === "Status") {
                      return (
                        <Td key={header.id}>
                          {getStatusBadge(row[header.id])}
                        </Td>
                      );
                    }
                    if (header.id === "SupplementTemplate") {
                      return (
                        <Td key={header.id}>
                          {getTemplateStatusBadge(row[header.id])}
                        </Td>
                      );
                    }
                    if (header.id === "Created" || header.id === "updated") {
                      return (
                        <Td key={header.id}>
                          {row[header.id] ? new Date(row[header.id]).toLocaleString() : "-"}
                        </Td>
                      );
                    }
                    return (
                      <Td key={header.id}>{row[header.id] || "-"}</Td>
                    );
                  })}
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="View Details">
                        <IconButton
                          variant="outline"
                          aria-label="View Details"
                          icon={<EyeIcon style={{ width: "14px", height: "14px" }} />}
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
                              onClick={() => handleEditRow(row.id)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton
                              variant="outline"
                              colorScheme="red"
                              aria-label="Delete"
                              icon={<TrashIcon style={{ height: "16px", width: "16px" }} />}
                              size="xs"
                              onClick={() => handleDeleteRow(row.id)}
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
                <Td colSpan={tableHeaders.length + 2} textAlign="center" py={4}>
                  No material data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination Controls */}
      <Flex justifyContent="space-between" mt={4} alignItems="center">
        <Text fontSize="sm">
          Showing {Math.min(rowsPerPage, filteredMaterials.length - (currentPage - 1) * rowsPerPage)} of {filteredMaterials.length} results
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            onClick={() => handlePageChange(1)}
            isDisabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {currentPage} of {Math.max(1, Math.ceil(filteredMaterials.length / rowsPerPage))}
          </Text>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage >= Math.ceil(filteredMaterials.length / rowsPerPage)}
          >
            Next
          </Button>
          <Button
            size="sm"
            onClick={() => handlePageChange(Math.ceil(filteredMaterials.length / rowsPerPage))}
            isDisabled={currentPage >= Math.ceil(filteredMaterials.length / rowsPerPage)}
          >
            Last
          </Button>
        </HStack>
      </Flex>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Material" : "Add New Material"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Order Number</FormLabel>
              <Input
                value={newRow.OrderNumber || ""}
                onChange={(e) => setNewRow({...newRow, OrderNumber: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Material Category</FormLabel>
              <Input
                value={newRow.MaterialCategory || ""}
                onChange={(e) => setNewRow({...newRow, MaterialCategory: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Vendor</FormLabel>
              <Input
                value={newRow.Vendor || ""}
                onChange={(e) => setNewRow({...newRow, Vendor: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Invitee</FormLabel>
              <Input
                value={newRow.Invitee || ""}
                onChange={(e) => setNewRow({...newRow, Invitee: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Host/Inviter Contact Information</FormLabel>
              <Input
                value={newRow.Host || ""}
                onChange={(e) => setNewRow({...newRow, Host: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Sender</FormLabel>
              <Input
                value={newRow.Sender || ""}
                onChange={(e) => setNewRow({...newRow, Sender: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Status</FormLabel>
              <Select
                value={newRow.Status || "Active"}
                onChange={(e) => setNewRow({...newRow, Status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Supplement Template</FormLabel>
              <Select
                value={newRow.SupplementTemplate || "Complete"}
                onChange={(e) => setNewRow({...newRow, SupplementTemplate: e.target.value})}
              >
                <option value="Complete">Complete</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Expired">Expired</option>
              </Select>
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
              Delete Material
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this material record? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MaterialReplenishmentTable;