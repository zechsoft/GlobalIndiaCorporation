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
  Switch,
  Stack,
} from "@chakra-ui/react";
import { SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import { PencilIcon, TrashIcon, UserPlusIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";

const DEFAULT_HEADERS = [
  { id: "supplierNumber", label: "Supplier Number", visible: true, altKey: "customerNumber" },
  { id: "supplier", label: "Supplier", visible: true, altKey: "Customer" },
  { id: "buyer", label: "Buyer", visible: true, altKey: null },
  { id: "secondOrderClassification", label: "Second-order Classification", visible: true, altKey: "SecondOrderClassification" },
  { id: "status", label: "Status", visible: true, altKey: "Status" },
  { id: "documentStatus", label: "Document Status", visible: true, altKey: "DocumentStatus" },
  { id: "abnormalInfo", label: "Abnormal Info", visible: true, altKey: "AbnormalInfo" },
  { id: "invitee", label: "Invitee", visible: true, altKey: "Invite" },
  { id: "reAuthPerson", label: "Re-auth Person", visible: true, altKey: "ReAuthPerson" },
  { id: "contactInfo", label: "Contact Info", visible: true, altKey: "ContactInfo" },
  { id: "invitationDate", label: "Invitation Date", visible: true, altKey: "InvitationDate" },
];

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

const getDocumentStatusBadge = (status) => {
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

const SupplierInformationTable = ({ 
  apiUrl = "https://globalindiabackendnew.onrender.com/api"
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDocStatus, setFilterDocStatus] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [tableHeaders, setTableHeaders] = useState(DEFAULT_HEADERS);
  const [newRow, setNewRow] = useState({
    supplierNumber: "",
    supplier: "",
    buyer: "",
    secondOrderClassification: "",
    status: "",
    documentStatus: "",
    abnormalInfo: "",
    invitee: "",
    reAuthPerson: "",
    contactInfo: "",
    invitationDate: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(7);
  
  const toast = useToast();
  const history = useHistory();
  const [rowToDelete, setRowToDelete] = useState(null);

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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/suppliers/get-all`, {
          withCredentials: true
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          const dataWithId = response.data.data.map(item => ({
            ...item,
            id: item._id
          }));
          setSuppliers(dataWithId);
          setFilteredSuppliers(dataWithId);
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

    fetchSuppliers();
  }, [apiUrl, toast]);

  useEffect(() => {
    let results = suppliers;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(supplier => 
        (supplier.supplierNumber || supplier.customerNumber || "").toString().toLowerCase().includes(term) ||
        (supplier.supplier || supplier.Customer || supplier.customerName || "").toLowerCase().includes(term) ||
        (supplier.buyer || "").toLowerCase().includes(term) ||
        (supplier.invitee || supplier.Invite || "").toLowerCase().includes(term)
      );
    }
    
    if (filterStatus !== "All") {
      results = results.filter(supplier => (supplier.status || supplier.Status) === filterStatus);
    }
    
    if (filterDocStatus !== "All") {
      results = results.filter(supplier => (supplier.documentStatus || supplier.DocumentStatus) === filterDocStatus);
    }
    
    setFilteredSuppliers(results);
  }, [searchTerm, filterStatus, filterDocStatus, suppliers]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDocStatus]);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredSuppliers.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewDetails = (row) => {
    setSelectedSupplierDetails(row);
    onViewModalOpen();
  };

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
      supplierNumber: "",
      supplier: "",
      buyer: "",
      secondOrderClassification: "",
      status: "",
      documentStatus: "",
      abnormalInfo: "",
      invitee: "",
      reAuthPerson: "",
      contactInfo: "",
      invitationDate: "",
    });
  };

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
    
    const selectedRow = suppliers.find((row) => row.id === rowId || row._id === rowId);
    if (selectedRow) {
      // Create a clean object with all the required fields
      const editRowData = {};
      
      // Ensure all table header fields are included
      tableHeaders.forEach(header => {
        // Try to get value from the primary key or the alternate key
        const value = header.altKey ? 
          (selectedRow[header.id] || selectedRow[header.altKey] || "") : 
          (selectedRow[header.id] || "");
        
        editRowData[header.id] = value;
      });
      
      // Set the row data for editing
      setNewRow(editRowData);
      setSelectedRowId(rowId);
      onModalOpen();
    }
  };
  
  const handleSaveRow = async() => {
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("User authentication required");
      }
  
      if (selectedRowId) {
        const updatedRow = { ...newRow, id: selectedRowId };
        const idForUpdate = updatedRow._id || updatedRow.id;
        
        await axios.put(`${apiUrl}/suppliers/${idForUpdate}`, 
          { supplierData: updatedRow, email: currentUser.email },
          { withCredentials: true }
        );
        
        const getResponse = await axios.get(`${apiUrl}/suppliers/get-all`,
          { withCredentials: true }
        );
        
        const dataWithId = getResponse.data.data.map(item => ({
          ...item,
          id: item._id
        }));
        
        setSuppliers(dataWithId);
        setFilteredSuppliers(dataWithId);
      } else {
        const dataToSend = {
          supplierNumber: newRow.supplierNumber,
          supplier: newRow.supplier,
          buyer: newRow.buyer,
          secondOrderClassification: newRow.secondOrderClassification,
          status: newRow.status,
          documentStatus: newRow.documentStatus,
          abnormalInfo: newRow.abnormalInfo,
          invitee: newRow.invitee,
          reAuthPerson: newRow.reAuthPerson,
          contactInfo: newRow.contactInfo,
          invitationDate: newRow.invitationDate,
        };
        
        await axios.post(`${apiUrl}/suppliers/add`,
          [dataToSend, {user: currentUser.email}],
          { withCredentials: true }
        );
        
        const getResponse = await axios.get(`${apiUrl}/suppliers/get-all`,
          { withCredentials: true }
        );
        
        const dataWithId = getResponse.data.data.map(item => ({
          ...item,
          id: item._id
        }));
        
        setSuppliers(dataWithId);
        setFilteredSuppliers(dataWithId);
      }
      
      onModalClose();
      setSelectedRowId(null);
      toast({
        title: "Success",
        description: selectedRowId ? "Row updated successfully" : "Row added successfully",
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
    
    const row = suppliers.find(r => r.id === rowId || r._id === rowId);
    setRowToDelete(row._id || row.id);
    onDeleteOpen();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("User authentication required");
      }
      
      await axios.delete(`${apiUrl}/suppliers/${rowToDelete}`, 
        { withCredentials: true }
      );
      
      const response = await axios.get(`${apiUrl}/suppliers/get-all`,
        { withCredentials: true }
      );
      
      if (response.data && Array.isArray(response.data.data)) {
        const dataWithId = response.data.data.map(item => ({
          ...item,
          id: item._id
        }));
        setSuppliers(dataWithId);
        setFilteredSuppliers(dataWithId);
      }
      
      setRowToDelete(null);
      onDeleteClose();
      
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error deleting supplier",
        description: error.response?.data?.message || error.message || "Failed to delete supplier",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "#," + tableHeaders
      .filter(header => header.visible)
      .map(header => header.label)
      .join(",") + ",Actions\n";
    
    filteredSuppliers.forEach((row, index) => {
      csvContent += `${index + 1},`;
      tableHeaders.filter(header => header.visible).forEach(header => {
        const value = header.altKey ? (row[header.id] || row[header.altKey] || "") : (row[header.id] || "");
        csvContent += `"${value.toString().replace(/"/g, '""')}",`;
      });
      csvContent += "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `supplier-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredSuppliers.length} supplier records to CSV`,
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
        <Text mt={3}>Loading supplier data...</Text>
      </Box>
    );
  }

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
      {error && (
        <Alert status="error" mb={5}>
          <AlertIcon />
          <Box flex="1">
            <Text>{error}</Text>
          </Box>
        </Alert>
      )}
      
      <HStack spacing={4} mb={5}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by supplier, number, buyer..."
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
          value={filterDocStatus} 
          onChange={(e) => setFilterDocStatus(e.target.value)}
        >
          <option value="All">All Document Statuses</option>
          <option value="Complete">Complete</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Expired">Expired</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredSuppliers.length === 0}
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
      
      <Text mb={3}>
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </Text>
      
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
                <Tr key={row._id || row.id} _hover={{ bg: "gray.50" }}>
                  <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => {
                      const value = header.altKey ? 
                        (row[header.id] || row[header.altKey] || "") : 
                        (row[header.id] || "");
                      
                      if (header.id === "status") {
                        return (
                          <Td key={header.id}>
                            {getStatusBadge(value)}
                          </Td>
                        );
                      }
                      
                      if (header.id === "documentStatus") {
                        return (
                          <Td key={header.id}>
                            {getDocumentStatusBadge(value)}
                          </Td>
                        );
                      }
                      
                      if (header.id === "invitationDate" && value) {
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
                    <Flex gap={2}>
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
                    </Flex>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={tableHeaders.filter(h => h.visible).length + 2} textAlign="center" py={4}>
                  No supplier data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination Controls */}
      <Flex justifyContent="space-between" mt={4} alignItems="center">
        <Text fontSize="sm">
          Showing {Math.min(rowsPerPage, filteredSuppliers.length - (currentPage - 1) * rowsPerPage)} of {filteredSuppliers.length} results
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
            Page {currentPage} of {Math.max(1, Math.ceil(filteredSuppliers.length / rowsPerPage))}
          </Text>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage >= Math.ceil(filteredSuppliers.length / rowsPerPage)}
          >
            Next
          </Button>
          <Button
            size="sm"
            onClick={() => handlePageChange(Math.ceil(filteredSuppliers.length / rowsPerPage))}
            isDisabled={currentPage >= Math.ceil(filteredSuppliers.length / rowsPerPage)}
          >
            Last
          </Button>
        </HStack>
      </Flex>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Supplier Entry Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSupplierDetails && (
              <Stack spacing={4}>
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Text fontWeight="bold" mb={2}>Entry Information</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created by:</Text>
                    <Text>{selectedSupplierDetails.user || "Unknown"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created on:</Text>
                    <Text>
                      {selectedSupplierDetails.createdAt 
                        ? new Date(selectedSupplierDetails.createdAt).toLocaleString() 
                        : "Unknown date"}
                    </Text>
                  </Flex>
                </Box>
                
                {selectedSupplierDetails.updatedAt && selectedSupplierDetails.updatedBy && (
                  <Box borderWidth="1px" borderRadius="lg" p={4} bg="blue.50">
                    <Text fontWeight="bold" mb={2}>Last Update</Text>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated by:</Text>
                      <Text>{selectedSupplierDetails.updatedBy}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="semibold" width="120px">Updated on:</Text>
                      <Text>{new Date(selectedSupplierDetails.updatedAt).toLocaleString()}</Text>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Supplier" : "Add New Supplier"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {tableHeaders.map(header => {
              const value = header.altKey ? 
                (newRow[header.id] || newRow[header.altKey] || "") : 
                (newRow[header.id] || "");
                
              return (
                <FormControl width="100%" mt={4} key={header.id}>
                  <FormLabel>{header.label}</FormLabel>
                  <Input
                    value={value}
                    onChange={(e) => setNewRow({ ...newRow, [header.id]: e.target.value })}
                    type={header.id === "invitationDate" ? "date" : "text"}
                    placeholder={`Enter ${header.label.toLowerCase()}`}
                  />
                </FormControl>
              );
            })}
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
              Delete Supplier
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete supplier {supplierToDelete?.supplier || supplierToDelete?.Customer}? 
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
    </Box>
  );
};

export default SupplierInformationTable;