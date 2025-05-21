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
  HStack,
  Stack,
  Divider
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon, HamburgerIcon } from "@chakra-ui/icons";
import { PencilIcon, TrashIcon, CogIcon, UserPlusIcon, EyeIcon } from "@heroicons/react/24/solid";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Approved":
      colorScheme = "green";
      break;
    case "Pending":
      colorScheme = "yellow";
      break;
    case "Rejected":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const MaterialInquiryTable = () => {
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
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const cancelRef = useRef();
  
  // Row management state
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [newRow, setNewRow] = useState({
    supplierMaterial: "",
    supplementOrderNumber: "",
    status: "Pending",
    explanation: "",
    createTime: "",
    updateTime: ""
  });

  // Header management state
  const [tableHeaders, setTableHeaders] = useState([
    { id: "supplierMaterial", label: "Supplier Material", visible: true, altKey: "Suppliermaterial" },
    { id: "supplementOrderNumber", label: "Supplement Order Number", visible: true, altKey: "OrderNumber" },
    { id: "status", label: "Status", visible: true },
    { id: "explanation", label: "Explanation", visible: true, altKey: "explaination" },
    { id: "createTime", label: "Create Time", visible: true, altKey: "createdTime" },
    { id: "updateTime", label: "Update Time", visible: true }
  ]);
  const [tempHeaders, setTempHeaders] = useState([]);

  // Define DEFAULT_HEADERS to use in reset
  const DEFAULT_HEADERS = [
    { id: "supplierMaterial", label: "Supplier Material", visible: true, altKey: "Suppliermaterial" },
    { id: "supplementOrderNumber", label: "Supplement Order Number", visible: true, altKey: "OrderNumber" },
    { id: "status", label: "Status", visible: true },
    { id: "explanation", label: "Explanation", visible: true, altKey: "explaination" },
    { id: "createTime", label: "Create Time", visible: true, altKey: "createdTime" },
    { id: "updateTime", label: "Update Time", visible: true }
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
        const response = await axios.get(`${API_BASE_URL}/api/material-inquiry/get-all`, {
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
        (material.Suppliermaterial && material.Suppliermaterial.toLowerCase().includes(term)) ||
        (material.supplierMaterial && material.supplierMaterial.toLowerCase().includes(term)) ||
        (material.OrderNumber && material.OrderNumber.toLowerCase().includes(term)) ||
        (material.supplementOrderNumber && material.supplementOrderNumber.toLowerCase().includes(term)) ||
        (material.explaination && material.explaination.toLowerCase().includes(term)) ||
        (material.explanation && material.explanation.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (filterStatus !== "All") {
      results = results.filter(material => material.status === filterStatus);
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
  };

  const handleHeaderVisibilityChange = (index) => {
    const updatedHeaders = [...tempHeaders];
    updatedHeaders[index].visible = !updatedHeaders[index].visible;
    setTempHeaders(updatedHeaders);
  };

  const saveHeaderChanges = async () => {
    try {
      if (isAdmin) {
        await axios.post(`${API_BASE_URL}/api/table-headers/update-material-inquiry`, 
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
      
      localStorage.setItem('materialInquiryTableHeaders', JSON.stringify(tempHeaders));
      
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

  // Row management functions
  const handleAddRow = () => {
    setSelectedRowId(null);
    setNewRow({
      supplierMaterial: "",
      supplementOrderNumber: "",
      status: "Pending",
      explanation: "",
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    });
    onModalOpen();
  };

  const handleEditRow = (rowId) => {
    const selectedRow = materials.find(row => row.id === rowId);
    if (selectedRow) {
      setNewRow({
        supplierMaterial: selectedRow.Suppliermaterial || selectedRow.supplierMaterial || "",
        supplementOrderNumber: selectedRow.OrderNumber || selectedRow.supplementOrderNumber || "",
        status: selectedRow.status || "Pending",
        explanation: selectedRow.explaination || selectedRow.explanation || "",
        createTime: selectedRow.createdTime || selectedRow.createTime || new Date().toISOString(),
        updateTime: selectedRow.updateTime || new Date().toISOString()
      });
      setSelectedRowId(rowId);
      onModalOpen();
    }
  };

  const handleViewDetails = (row) => {
    setSelectedMaterial(row);
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
        supplierMaterial: newRow.supplierMaterial || "",
        supplementOrderNumber: newRow.supplementOrderNumber || "",
        status: newRow.status || "Pending",
        explanation: newRow.explanation || "",
        updateTime: currentDateTime,
        updatedBy: currentUser.email
      };

      if (selectedRowId) {
        // Update existing row
        await axios.post(
          `${API_BASE_URL}/api/material-inquiry/add-material`,
          [ 
            { ...rowData, id: selectedRowId },
            { user: currentUser.email }
          ],
          { withCredentials: true }
        );
      } else {
        // Add new row
        rowData.createTime = currentDateTime;
        await axios.post(
          `${API_BASE_URL}/api/material-inquiry/add-material`,
          [rowData, { user: currentUser.email }],
          { withCredentials: true }
        );
      }

      // Refresh data
      const response = await axios.get(`${API_BASE_URL}/api/material-inquiry/get-all`, {
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
        `${API_BASE_URL}/api/material-inquiry/delete-material`, 
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
    csvContent += "#,Supplier Material,Supplement Order Number,Status,Explanation,Create Time,Update Time\n";
    
    filteredMaterials.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `"${row.Suppliermaterial || row.supplierMaterial || ""}",`;
      csvContent += `"${row.OrderNumber || row.supplementOrderNumber || ""}",`;
      csvContent += `${row.status || ""},`;
      csvContent += `"${row.explaination || row.explanation || ""}",`;
      csvContent += `${row.createdTime || row.createTime ? new Date(row.createdTime || row.createTime).toLocaleString() : ""},`;
      csvContent += `${row.updateTime ? new Date(row.updateTime).toLocaleString() : ""}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `material-inquiry-data-${new Date().toISOString().slice(0,10)}.csv`);
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
            placeholder="Search by material, order number..."
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
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
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
        Showing {filteredMaterials.length} of {materials.length} materials
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
                      if (header.id === "status") {
                        return (
                          <Td key={header.id}>
                            {getStatusBadge(row[header.id])}
                          </Td>
                        );
                      }
                      if (header.id === "createTime" || header.id === "updateTime") {
                        return (
                          <Td key={header.id}>
                            {row[header.altKey] || row[header.id] ? new Date(row[header.altKey] || row[header.id]).toLocaleString() : "-"}
                          </Td>
                        );
                      }
                      return (
                        <Td key={header.id}>{row[header.altKey] || row[header.id] || "-"}</Td>
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
                <Td colSpan={tableHeaders.filter(h => h.visible).length + 2} textAlign="center" py={4}>
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
              <FormLabel>Supplier Material</FormLabel>
              <Input
                value={newRow.supplierMaterial || ""}
                onChange={(e) => setNewRow({...newRow, supplierMaterial: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Supplement Order Number</FormLabel>
              <Input
                value={newRow.supplementOrderNumber || ""}
                onChange={(e) => setNewRow({...newRow, supplementOrderNumber: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Status</FormLabel>
              <Select
                value={newRow.status || "Pending"}
                onChange={(e) => setNewRow({...newRow, status: e.target.value})}
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Explanation</FormLabel>
              <Input
                value={newRow.explanation || ""}
                onChange={(e) => setNewRow({...newRow, explanation: e.target.value})}
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

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Material Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMaterial && (
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>Basic Information</Text>
                  <Divider mb={3} />
                  <Stack spacing={3}>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Supplier Material:</Text>
                      <Text>{selectedMaterial.Suppliermaterial || selectedMaterial.supplierMaterial || "-"}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Supplement Order Number:</Text>
                      <Text>{selectedMaterial.OrderNumber || selectedMaterial.supplementOrderNumber || "-"}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Status:</Text>
                      <Text>{getStatusBadge(selectedMaterial.status)}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Explanation:</Text>
                      <Text>{selectedMaterial.explaination || selectedMaterial.explanation || "-"}</Text>
                    </Flex>
                  </Stack>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>Timestamps</Text>
                  <Divider mb={3} />
                  <Stack spacing={3}>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Created On:</Text>
                      <Text>
                        {selectedMaterial.createdTime || selectedMaterial.createTime 
                          ? new Date(selectedMaterial.createdTime || selectedMaterial.createTime).toLocaleString() 
                          : "-"}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Created By:</Text>
                      <Text>{selectedMaterial.user || "-"}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Last Updated:</Text>
                      <Text>
                        {selectedMaterial.updateTime 
                          ? new Date(selectedMaterial.updateTime).toLocaleString() 
                          : "-"}
                      </Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="180px">Updated By:</Text>
                      <Text>{selectedMaterial.updatedBy || "-"}</Text>
                    </Flex>
                  </Stack>
                </Box>
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

      {/* Table Header Management Modal */}
      <Modal isOpen={isHeaderModalOpen} onClose={onHeaderModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Table Columns</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justify="space-between" mb={4}>
              <Text>Configure which columns are visible and their order</Text>
              <Button size="sm" colorScheme="blue" variant="outline" onClick={() => setTempHeaders(DEFAULT_HEADERS)}>
                Reset to Default
              </Button>
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
                  <IconButton
                    icon={<HamburgerIcon />}
                    size="sm"
                    variant="ghost"
                    mr={2}
                    cursor="grab"
                  />
                  
                  <Text flex={1}>{header.label}</Text>

                  <Flex>
                    {isAdmin && (
                      <IconButton
                        icon={<TrashIcon style={{ width: "14px", height: "14px" }} />}
                        size="sm"
                        variant="ghost"
                        mr={2}
                        onClick={() => {
                          const updated = [...tempHeaders];
                          updated.splice(index, 1);
                          setTempHeaders(updated);
                        }}
                        colorScheme="red"
                      />
                    )}

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
    </Box>
  );
};

export default MaterialInquiryTable;