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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
  useToast,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  HStack
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon, HamburgerIcon } from "@chakra-ui/icons";
import { PencilIcon, TrashIcon, CogIcon, UserPlusIcon, EyeIcon } from "@heroicons/react/24/solid";
import axios from "axios";

// Updated API base URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Complete":
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

// Order status badge styling helper
const getOrderStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Fulfilled":
      colorScheme = "green";
      break;
    case "Processing":
      colorScheme = "blue";
      break;
    case "Delayed":
      colorScheme = "orange";
      break;
    case "Cancelled":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const CustomerOrder = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const toast = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(7);
  
  // Modal and dialog controls
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isHeaderModalOpen, onOpen: onHeaderModalOpen, onClose: onHeaderModalClose } = useDisclosure();
  const { isOpen: isAddHeaderModalOpen, onOpen: onAddHeaderModalOpen, onClose: onAddHeaderModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const cancelRef = useRef();
  
  // Row management state
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);
  const [newRow, setNewRow] = useState({
    customerNumber: "",
    customer: "",
    buyer: "",
    platformNo: "",
    poNo: "",
    purchaseDate: "",
    orderAmount: "",
    currency: "",
    purchasingDepartment: "",
    purchaser: "",
    requisitionBusinessGroup: "",
    deliveryStatus: "Pending",
    orderStatus: "Processing",
    acceptanceStatus: "",
    statementStatus: "",
  });

  // Header management state
  const [tableHeaders, setTableHeaders] = useState([
    { id: "customerNumber", label: "Customer Number", visible: true },
    { id: "customer", label: "Customer", visible: true },
    { id: "buyer", label: "Buyer", visible: true },
    { id: "platformNo", label: "Platform No", visible: true },
    { id: "poNo", label: "PO No", visible: true },
    { id: "purchaseDate", label: "Purchase Date", visible: true },
    { id: "orderAmount", label: "Order Amount", visible: true },
    { id: "currency", label: "Currency", visible: true },
    { id: "purchasingDepartment", label: "Purchasing Department", visible: true },
    { id: "purchaser", label: "Purchaser", visible: true },
    { id: "requisitionBusinessGroup", label: "Requisition Business Group", visible: true },
    { id: "deliveryStatus", label: "Delivery Status", visible: true },
    { id: "orderStatus", label: "Order Status", visible: true },
    { id: "acceptanceStatus", label: "Acceptance Status", visible: true },
    { id: "statementStatus", label: "Statement Status", visible: true },
  ]);
  const [tempHeaders, setTempHeaders] = useState([]);
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderName, setNewHeaderName] = useState("");
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: "",
    label: "",
    visible: true
  });

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        if (!user) {
          throw new Error("User not authenticated");
        }
        setCurrentUser(user);
        setIsAdmin(user.role === "admin");
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
        const response = await axios.get(`${API_BASE_URL}/api/customer/get-all`, {
          withCredentials: true
        });
        
        // Map _id to id for consistency
        const dataWithIds = response.data.data.map(item => ({
          ...item,
          id: item._id
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
  }, [currentUser, toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = materials;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(material => 
        (material.customerNumber && material.customerNumber.toLowerCase().includes(term)) ||
        (material.customer && material.customer.toLowerCase().includes(term)) ||
        (material.buyer && material.buyer.toLowerCase().includes(term)) ||
        (material.platformNo && material.platformNo.toLowerCase().includes(term)) ||
        (material.poNo && material.poNo.toLowerCase().includes(term)) ||
        (material.purchaseDate && material.purchaseDate.toLowerCase().includes(term)) ||
        (material.orderAmount && material.orderAmount.toString().includes(term)) ||
        (material.currency && material.currency.toLowerCase().includes(term)) ||
        (material.purchasingDepartment && material.purchasingDepartment.toLowerCase().includes(term)) ||
        (material.purchaser && material.purchaser.toLowerCase().includes(term)) ||
        (material.requisitionBusinessGroup && material.requisitionBusinessGroup.toLowerCase().includes(term)) ||
        (material.deliveryStatus && material.deliveryStatus.toLowerCase().includes(term)) ||
        (material.orderStatus && material.orderStatus.toLowerCase().includes(term)) ||
        (material.acceptanceStatus && material.acceptanceStatus.toLowerCase().includes(term)) ||
        (material.statementStatus && material.statementStatus.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(material => material.deliveryStatus === filterStatus || material.orderStatus === filterStatus);
    }
    
    setFilteredMaterials(results);
  }, [searchTerm, filterStatus, materials]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

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

  // Header management functions
  const openHeaderModal = () => {
    setTempHeaders([...tableHeaders]);
    onHeaderModalOpen();
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
      if (isAdmin) {
        await axios.post(`${API_BASE_URL}/api/table-headers/update-customer-order`, 
          { 
            headers: tempHeaders,
            email: currentUser.email
          },
          { withCredentials: true }
        );
        
        toast({
          title: "Table headers updated globally",
          description: "All users will see your changes",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
      
      setTableHeaders(tempHeaders);
      onHeaderModalClose();
      
      localStorage.setItem('customerOrderTableHeaders', JSON.stringify(tempHeaders));
      
    } catch (error) {
      console.error("Error saving header changes:", error);
      toast({
        title: "Error saving header changes",
        description: error.response?.data?.message || "Failed to update table headers",
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
    onAddHeaderModalOpen();
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
      visible: true
    };
    
    setTempHeaders([...tempHeaders, newHeader]);
    onAddHeaderModalClose();
    
    setNewHeaderInfo({
      id: "",
      label: "",
      visible: true
    });
  };

  const resetHeadersToDefault = () => {
    setTempHeaders([
      { id: "customerNumber", label: "Customer Number", visible: true },
      { id: "customer", label: "Customer", visible: true },
      { id: "buyer", label: "Buyer", visible: true },
      { id: "platformNo", label: "Platform No", visible: true },
      { id: "poNo", label: "PO No", visible: true },
      { id: "purchaseDate", label: "Purchase Date", visible: true },
      { id: "orderAmount", label: "Order Amount", visible: true },
      { id: "currency", label: "Currency", visible: true },
      { id: "purchasingDepartment", label: "Purchasing Department", visible: true },
      { id: "purchaser", label: "Purchaser", visible: true },
      { id: "requisitionBusinessGroup", label: "Requisition Business Group", visible: true },
      { id: "deliveryStatus", label: "Delivery Status", visible: true },
      { id: "orderStatus", label: "Order Status", visible: true },
      { id: "acceptanceStatus", label: "Acceptance Status", visible: true },
      { id: "statementStatus", label: "Statement Status", visible: true },
    ]);
  };

  // Row management functions
  const handleAddRow = () => {
    setSelectedRowId(null);
    setNewRow({
      customerNumber: "",
      customer: "",
      buyer: "",
      platformNo: "",
      poNo: "",
      purchaseDate: "",
      orderAmount: "",
      currency: "",
      purchasingDepartment: "",
      purchaser: "",
      requisitionBusinessGroup: "",
      deliveryStatus: "Pending",
      orderStatus: "Processing",
      acceptanceStatus: "",
      statementStatus: "",
    });
    onModalOpen();
  };

  const handleEditRow = (rowId) => {
    const selectedRow = materials.find(row => row.id === rowId);
    if (selectedRow) {
      setNewRow({
        ...selectedRow,
      });
      setSelectedRowId(rowId);
      onModalOpen();
    }
  };

  const handleViewDetails = (row) => {
    setSelectedRowDetails(row);
    onViewModalOpen();
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    onDeleteOpen();
  };

   const handleSaveRow = async () => {
    try {
      const currentDateTime = new Date().toISOString();
      
      // Map the frontend data structure to match backend expectations
      const rowData = {
        customerNumber: newRow.customerNumber || "",
        customer: newRow.customer || "",
        buyer: newRow.buyer || "",
        platformNo: newRow.platformNo || "",
        poNo: newRow.poNo || "",
        purchaseDate: newRow.purchaseDate || "",
        orderAmount: newRow.orderAmount || "",
        currency: newRow.currency || "",
        purchasingDepartment: newRow.purchasingDepartment || "",
        purchaser: newRow.purchaser || "",
        requisitionBusinessGroup: newRow.requisitionBusinessGroup || "",
        deliveryStatus: newRow.deliveryStatus || "Pending",
        orderStatus: newRow.orderStatus || "Processing",
        acceptanceStatus: newRow.acceptanceStatus || "",
        statementStatus: newRow.statementStatus || "",
        updateTime: currentDateTime
      };

      if (selectedRowId) {
        // Update existing row
        await axios.post(
          `${API_BASE_URL}/api/customer/update-data`,
          { 
            data: {
              ...rowData,
              id: selectedRowId
            }, 
            email: currentUser.email 
          },
          { withCredentials: true }
        );
      } else {
        // Add new row
        rowData.createTime = currentDateTime;
        await axios.post(
          `${API_BASE_URL}/api/customer/add-data`,
          [rowData, { user: currentUser.email }],
          { withCredentials: true }
        );
      }

      // Refresh data
      const response = await axios.get(`${API_BASE_URL}/api/customer/get-all`, {
        withCredentials: true
      });
      
      const dataWithIds = response.data.data.map(item => ({
        ...item,
        id: item._id
      }));
      
      setMaterials(dataWithIds);
      setFilteredMaterials(dataWithIds);
      
      toast({
        title: selectedRowId ? "Row updated" : "Row added",
        description: selectedRowId 
          ? "The row has been successfully updated" 
          : "A new row has been successfully added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
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
      await axios.post(
        `${API_BASE_URL}/api/customer/delete-data`, 
        { 
          id: rowToDelete,
          email: currentUser.email 
        }, 
        { withCredentials: true }
      );
      
      const updatedMaterials = materials.filter(row => row.id !== rowToDelete);
      setMaterials(updatedMaterials);
      setFilteredMaterials(filteredMaterials.filter(row => row.id !== rowToDelete));
      
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
    csvContent += "#,Customer Number,Customer,Buyer,Platform No,PO No,Purchase Date,Order Amount,Currency,Purchasing Department,Purchaser,Requisition Business Group,Delivery Status,Order Status,Acceptance Status,Statement Status\n";
    
    filteredMaterials.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `${row.customerNumber || ""},`;
      csvContent += `"${row.customer || ""}",`;
      csvContent += `"${row.buyer || ""}",`;
      csvContent += `${row.platformNo || ""},`;
      csvContent += `${row.poNo || ""},`;
      csvContent += `${row.purchaseDate || ""},`;
      csvContent += `${row.orderAmount || ""},`;
      csvContent += `${row.currency || ""},`;
      csvContent += `${row.purchasingDepartment || ""},`;
      csvContent += `${row.purchaser || ""},`;
      csvContent += `${row.requisitionBusinessGroup || ""},`;
      csvContent += `${row.deliveryStatus || ""},`;
      csvContent += `${row.orderStatus || ""},`;
      csvContent += `${row.acceptanceStatus || ""},`;
      csvContent += `${row.statementStatus || ""}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer-order-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredMaterials.length} customer records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading customer data...</Text>
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
            placeholder="Search by customer, order number..."
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
          <option value="Complete">Complete</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Processing">Processing</option>
          <option value="Delayed">Delayed</option>
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

        <Menu>
          <MenuButton as={Button} size="sm" rightIcon={<CogIcon style={{ width: "16px", height: "16px" }} />}>
            Table Options
          </MenuButton>
          <MenuList>
            <MenuItem onClick={openHeaderModal}>Manage Columns</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredMaterials.length} of {materials.length} customer orders
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              <Th>#</Th>
              {tableHeaders
                .filter(header => header.visible)
                .map(header => (
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
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => {
                      if (header.id === "deliveryStatus") {
                        return (
                          <Td key={header.id}>
                            {getStatusBadge(row[header.id])}
                          </Td>
                        );
                      }
                      if (header.id === "orderStatus") {
                        return (
                          <Td key={header.id}>
                            {getOrderStatusBadge(row[header.id])}
                          </Td>
                        );
                      }
                      if (header.id === "purchaseDate") {
                        return (
                          <Td key={header.id}>
                            {row[header.id] ? new Date(row[header.id]).toLocaleDateString() : "-"}
                          </Td>
                        );
                      }
                      if (header.id === "orderAmount") {
                        return (
                          <Td key={header.id} isNumeric>
                            {row[header.id] ? Number(row[header.id]).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }) : "-"}
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
                          onClick={() => handleEditRow(row.id)}
                        />
                      </Tooltip>
                      {isAdmin && (
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
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={tableHeaders.filter(h => h.visible).length + 2} textAlign="center" py={4}>
                  No customer data matching current filters
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
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Customer Order" : "Add New Customer Order"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexWrap="wrap" gap={4}>
              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Customer Number</FormLabel>
                <Input
                  value={newRow.customerNumber || ""}
                  onChange={(e) => setNewRow({...newRow, customerNumber: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Customer</FormLabel>
                <Input
                  value={newRow.customer || ""}
                  onChange={(e) => setNewRow({...newRow, customer: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Customer</FormLabel>
                <Input
                  value={newRow.customer || ""}
                  onChange={(e) => setNewRow({...newRow, customer: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Buyer</FormLabel>
                <Input
                  value={newRow.buyer || ""}
                  onChange={(e) => setNewRow({...newRow, buyer: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Platform No</FormLabel>
                <Input
                  value={newRow.platformNo || ""}
                  onChange={(e) => setNewRow({...newRow, platformNo: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>PO No</FormLabel>
                <Input
                  value={newRow.poNo || ""}
                  onChange={(e) => setNewRow({...newRow, poNo: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Purchase Date</FormLabel>
                <Input
                  type="date"
                  value={newRow.purchaseDate || ""}
                  onChange={(e) => setNewRow({...newRow, purchaseDate: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Order Amount</FormLabel>
                <Input
                  type="number"
                  value={newRow.orderAmount || ""}
                  onChange={(e) => setNewRow({...newRow, orderAmount: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Currency</FormLabel>
                <Input
                  value={newRow.currency || ""}
                  onChange={(e) => setNewRow({...newRow, currency: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Purchasing Department</FormLabel>
                <Input
                  value={newRow.purchasingDepartment || ""}
                  onChange={(e) => setNewRow({...newRow, purchasingDepartment: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Purchaser</FormLabel>
                <Input
                  value={newRow.purchaser || ""}
                  onChange={(e) => setNewRow({...newRow, purchaser: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Requisition Business Group</FormLabel>
                <Input
                  value={newRow.requisitionBusinessGroup || ""}
                  onChange={(e) => setNewRow({...newRow, requisitionBusinessGroup: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Delivery Status</FormLabel>
                <Select
                  value={newRow.deliveryStatus || "Pending"}
                  onChange={(e) => setNewRow({...newRow, deliveryStatus: e.target.value})}
                >
                  <option value="Complete">Complete</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Order Status</FormLabel>
                <Select
                  value={newRow.orderStatus || "Processing"}
                  onChange={(e) => setNewRow({...newRow, orderStatus: e.target.value})}
                >
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Processing">Processing</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Acceptance Status</FormLabel>
                <Input
                  value={newRow.acceptanceStatus || ""}
                  onChange={(e) => setNewRow({...newRow, acceptanceStatus: e.target.value})}
                />
              </FormControl>

              <FormControl flex="1 1 200px" mb={4}>
                <FormLabel>Statement Status</FormLabel>
                <Input
                  value={newRow.statementStatus || ""}
                  onChange={(e) => setNewRow({...newRow, statementStatus: e.target.value})}
                />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
              {selectedRowId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={onModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customer Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRowDetails && (
              <Stack spacing={4}>
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Text fontWeight="bold" mb={2}>Entry Information</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created by:</Text>
                    <Text>{selectedRowDetails.user || "Unknown"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created on:</Text>
                    <Text>
                      {selectedRowDetails.createdAt 
                        ? new Date(selectedRowDetails.createdAt).toLocaleString() 
                        : "Unknown date"}
                    </Text>
                  </Flex>
                </Box>
                
                {selectedRowDetails.updatedAt && selectedRowDetails.updatedBy && (
                  <Box borderWidth="1px" borderRadius="lg" p={4} bg="blue.50">
                    <Text fontWeight="bold" mb={2}>Last Update</Text>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated by:</Text>
                      <Text>{selectedRowDetails.updatedBy}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated on:</Text>
                      <Text>{new Date(selectedRowDetails.updatedAt).toLocaleString()}</Text>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Customer Order
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this customer order record? This action cannot be undone.
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

      {/* Table Header Management Modal */}
      <Modal isOpen={isHeaderModalOpen} onClose={onHeaderModalClose} size="xl">
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
                    
                    {isAdmin && (
                      <IconButton
                        icon={<TrashIcon style={{ width: "14px", height: "14px" }} />}
                        size="sm"
                        variant="ghost"
                        mr={2}
                        onClick={() => deleteHeader(index)}
                        colorScheme="red"
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
            <Button variant="outline" onClick={onHeaderModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add New Header Modal */}
      <Modal isOpen={isAddHeaderModalOpen} onClose={onAddHeaderModalClose} size="md">
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
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveNewHeader}>
              Add Column
            </Button>
            <Button variant="ghost" onClick={onAddHeaderModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomerOrder;