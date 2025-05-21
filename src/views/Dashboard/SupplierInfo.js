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
  Badge,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon, CogIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Updated API base URL to the deployed Render URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

// Default table headers configuration
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

// Document status badge styling helper
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

const SupplierInfo = () => {
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
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"));
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
  const [saveAsGlobal, setSaveAsGlobal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const searchInputRef = useRef(null);
  const cancelRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const toast = useToast();
  const navigate = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/suppliers/get-data`, {"email": user.email}, {
          withCredentials: true,
        });

        setTableData(response.data.data);
        setFilteredData(response.data.data);
        setIsAdmin(user.role === "admin");
        
        try {
          const headerResponse = await axios.get(
            `${API_BASE_URL}/api/table-headers/get?email=${user.email}`, 
            { withCredentials: true }
          );
          
          if (headerResponse.data.headers) {
            setTableHeaders(headerResponse.data.headers);
          } else {
            setTableHeaders(DEFAULT_HEADERS);
          }
        } catch (headerError) {
          console.error("Error fetching table headers:", headerError);
          const savedHeaders = localStorage.getItem('supplierTableHeaders');
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

  useEffect(() => {
    localStorage.setItem('supplierTableHeaders', JSON.stringify(tableHeaders));
  }, [tableHeaders]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleViewDetails = (row) => {
    setSelectedSupplierDetails(row);
    setIsViewModalOpen(true);
  };

  const handleAddRow = () => {
    setIsModalOpen(true);
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
    const selectedRow = tableData.find((row) => row._id === rowId || row.id === rowId);
    if (selectedRow) {
      setNewRow({
        supplierNumber: selectedRow.supplierNumber || selectedRow.customerNumber,
        supplier: selectedRow.supplier || selectedRow.Customer,
        buyer: selectedRow.buyer,
        secondOrderClassification: selectedRow.secondOrderClassification || selectedRow.SecondOrderClassification,
        status: selectedRow.status || selectedRow.Status,
        documentStatus: selectedRow.documentStatus || selectedRow.DocumentStatus,
        abnormalInfo: selectedRow.abnormalInfo || selectedRow.AbnormalInfo,
        invitee: selectedRow.invitee || selectedRow.Invite,
        reAuthPerson: selectedRow.reAuthPerson || selectedRow.ReAuthPerson,
        contactInfo: selectedRow.contactInfo || selectedRow.ContactInfo,
        invitationDate: selectedRow.invitationDate || selectedRow.InvitationDate,
      });
      setSelectedRowId(selectedRow._id || rowId);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const supplierToDelete = tableData.find(row => row.id === rowToDelete);
      
      if (!supplierToDelete) {
        throw new Error("Supplier not found");
      }
      
      let mongoId = null;
      
      if (supplierToDelete._id) mongoId = supplierToDelete._id;
      else if (supplierToDelete.id) mongoId = supplierToDelete.id;
      else if (supplierToDelete.supplierId) mongoId = supplierToDelete.supplierId;
      else if (supplierToDelete.supplierNumber) mongoId = supplierToDelete.supplierNumber;
      
      if (!mongoId) {
        console.log("Available fields on supplier:", Object.keys(supplierToDelete));
        throw new Error("Could not determine supplier database ID");
      }
      
      await axios.delete(`${API_BASE_URL}/api/suppliers/${mongoId}`, {
        withCredentials: true
      });
      
      const updatedTableData = tableData.filter((row) => row.id !== rowToDelete);
      setTableData(updatedTableData);
      setFilteredData(updatedTableData.filter((row) => filterRow(row)));
      
      toast({
        title: "Supplier deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error deleting supplier",
        description: error.message || "Could not delete the supplier",
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
      if (selectedRowId) {
        // For editing an existing row
        const rowToUpdate = tableData.find(row => row._id === selectedRowId || row.id === selectedRowId);
        
        if (!rowToUpdate) {
          throw new Error("Could not find the row to update");
        }
        
        // Use MongoDB _id for the update if available
        const mongoId = rowToUpdate._id || rowToUpdate.id;
        
        // Create updated row object - maintain the original _id
        const updatedRowData = { 
          ...rowToUpdate,
          supplierNumber: newRow.supplierNumber,
          supplier: newRow.supplier,
          Customer: newRow.supplier,
          customerNumber: newRow.supplierNumber,
          buyer: newRow.buyer,
          secondOrderClassification: newRow.secondOrderClassification,
          SecondOrderClassification: newRow.secondOrderClassification,
          status: newRow.status,
          Status: newRow.status,
          documentStatus: newRow.documentStatus,
          DocumentStatus: newRow.documentStatus,
          abnormalInfo: newRow.abnormalInfo,
          AbnormalInfo: newRow.abnormalInfo,
          invitee: newRow.invitee,
          Invite: newRow.invitee,
          reAuthPerson: newRow.reAuthPerson,
          ReAuthPerson: newRow.reAuthPerson,
          contactInfo: newRow.contactInfo,
          ContactInfo: newRow.contactInfo,
          invitationDate: newRow.invitationDate,
          InvitationDate: newRow.invitationDate,
          updatedAt: new Date(),
          updatedBy: user.email
        };
        
        // Update in local state - make sure we're using the correct ID to match rows
        const updatedTableData = tableData.map(row => 
          (row._id === mongoId || row.id === selectedRowId) ? updatedRowData : row
        );
        
        setTableData(updatedTableData);
        setFilteredData(updatedTableData.filter(row => filterRow(row)));
        
        // Send update to server - making sure to use the MongoDB _id
        await axios.post(`${API_BASE_URL}/api/suppliers/update`, [
          {
            id: mongoId, // Use the MongoDB ID here
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
          },
          {"user": user.email}
        ], {
          withCredentials: true
        });

        toast({
          title: "Row updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // For adding a new row
        const newRowId = tableData.length > 0 ? Math.max(...tableData.map(row => parseInt(row.id) || 0)) + 1 : 1;
        
        const updatedRow = { 
          ...newRow, 
          id: newRowId,
          Customer: newRow.supplier,
          customerNumber: newRow.supplierNumber,
          SecondOrderClassification: newRow.secondOrderClassification,
          Status: newRow.status,
          DocumentStatus: newRow.documentStatus,
          AbnormalInfo: newRow.abnormalInfo,
          Invite: newRow.invitee,
          ReAuthPerson: newRow.reAuthPerson,
          ContactInfo: newRow.contactInfo,
          InvitationDate: newRow.invitationDate,
          createdAt: new Date(),
          user: user.email
        };
        
        const newTableData = [...tableData, updatedRow];
        setTableData(newTableData);
        setFilteredData(newTableData.filter((row) => filterRow(row)));
        
        await axios.post(`${API_BASE_URL}/api/suppliers/add`, [
          {
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
          },
          {"user": user.email}
        ], {
          withCredentials: true
        });
        
        toast({
          title: "Row added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error saving row:", err);
      toast({
        title: "Error saving row",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsModalOpen(false);
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
      setSelectedRowId(null);
    }
  };

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
        const value = header.altKey 
          ? (row[header.id] || row[header.altKey] || "") 
          : (row[header.id] || "");
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return value.toString().includes(searchTerm);
        }
      });
    } else {
      const header = tableHeaders.find(h => h.label === country);
      if (!header) return true;
      
      const value = header.altKey ? (row[header.id] || row[header.altKey] || "") : (row[header.id] || "");
      
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

  const openHeaderModal = () => {
    setTempHeaders([...tableHeaders]);
    setIsHeaderModalOpen(true);
    setEditingHeader(null);
    setSaveAsGlobal(false);
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
    setIsSaving(true);
    try {
      const payload = {
        headers: tempHeaders,
        email: user.email,
        isGlobal: isAdmin && saveAsGlobal
      };
      
      await axios.post(
        `${API_BASE_URL}/api/table-headers/update`, 
        payload,
        { withCredentials: true }
      );
      
      setTableHeaders(tempHeaders);
      setIsHeaderModalOpen(false);
      localStorage.setItem('supplierTableHeaders', JSON.stringify(tempHeaders));
      
      toast({
        title: payload.isGlobal 
          ? "Table headers updated globally" 
          : "Table headers updated",
        description: payload.isGlobal 
          ? "All users will see your changes" 
          : "Your custom headers have been saved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error("Error saving header changes:", error);
      toast({
        title: "Error saving header changes",
        description: error.response?.data?.message || "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
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
            <Text fontSize="xl" fontWeight="bold">Supplier Information</Text>
            <Text fontSize="md" color="gray.400">Manage Supplier Information</Text>
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
                <Th color="gray.400">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row.id}>
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => {
                      const value = header.altKey 
                        ? (row[header.id] || row[header.altKey] || "") 
                        : (row[header.id] || "");

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
                      <Tooltip label="Edit">
                        <IconButton
                          variant="outline"
                          aria-label="Edit"
                          icon={<PencilIcon style={{ width: "14px", height: "14px" }} />}
                          size="xs"
                          onClick={() => handleEditRow(row._id || row.id)}
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
                  </Td>
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
          <ModalHeader>{selectedRowId ? "Edit Supplier" : "Add New Supplier"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {tableHeaders.map(header => (
              <FormControl width="100%" mt={4} key={header.id}>
                <FormLabel>{header.label}</FormLabel>
                <Input
                  value={newRow[header.id] || ""}
                  onChange={(e) => setNewRow({ ...newRow, [header.id]: e.target.value })}
                  type={header.id === "invitationDate" ? "date" : "text"}
                />
              </FormControl>
            ))}
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
            <Button colorScheme="blue" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
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
              Delete Supplier
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this supplier? This action cannot be undone.
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
            {isAdmin && (
              <Checkbox 
                isChecked={saveAsGlobal} 
                onChange={(e) => setSaveAsGlobal(e.target.checked)}
                mb={3}
              >
                Save as global default (affects all users)
              </Checkbox>
            )}
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={saveHeaderChanges}
              isLoading={isSaving}
            >
              {saveAsGlobal && isAdmin ? "Save Global Changes" : "Save Changes"}
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

export default SupplierInfo;