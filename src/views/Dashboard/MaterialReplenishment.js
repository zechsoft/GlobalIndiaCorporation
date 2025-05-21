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
  Stack,
  Badge,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon, CogIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";
import axios from "axios";

// API base URL for the deployed backend
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
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

const MaterialReplenishment = () => {
  const user = JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : JSON.parse(sessionStorage.getItem("user"));
  const toast = useToast();
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [newRow, setNewRow] = useState({
    orderNumber: "",
    materialCategory: "",
    vendor: "",
    invitee: "",
    hostInviterContactInfo: "",
    sender: "",
    status: "",
    supplementTemplate: "",
    createTime: "",
    updateTime: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Table header management state
  const [tableHeaders, setTableHeaders] = useState([
    { id: "orderNumber", label: "Order Number", visible: true, altKey: "OrderNumber" },
    { id: "materialCategory", label: "Material Category", visible: true, altKey: "MaterialCategory" },
    { id: "vendor", label: "Vendor", visible: true, altKey: "Vendor" },
    { id: "invitee", label: "Invitee", visible: true, altKey: "Invitee" },
    { id: "hostInviterContactInfo", label: "Host/Inviter Contact Information", visible: true, altKey: "Host" },
    { id: "sender", label: "Sender", visible: true, altKey: "Sender" },
    { id: "status", label: "Status", visible: true, altKey: "Status" },
    { id: "supplementTemplate", label: "Supplement Template", visible: true, altKey: "SupplementTemplate" },
    { id: "createTime", label: "Create Time", visible: true, altKey: "Created" },
    { id: "updateTime", label: "Update Time", visible: true, altKey: "updated" },
  ]);
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

  const searchInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const cancelRef = useRef();

  const handleViewDetails = (row) => {
    setSelectedDetails(row);
    setIsViewModalOpen(true);
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
      if (isAdmin) {
        await axios.post(`${API_BASE_URL}/api/table-headers/update-material`, 
          { 
            headers: tempHeaders,
            email: user.email
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
      setIsHeaderModalOpen(false);
      localStorage.setItem('materialTableHeaders', JSON.stringify(tempHeaders));
      
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
    setTempHeaders([
      { id: "orderNumber", label: "Order Number", visible: true, altKey: "OrderNumber" },
      { id: "materialCategory", label: "Material Category", visible: true, altKey: "MaterialCategory" },
      { id: "vendor", label: "Vendor", visible: true, altKey: "Vendor" },
      { id: "invitee", label: "Invitee", visible: true, altKey: "Invitee" },
      { id: "hostInviterContactInfo", label: "Host/Inviter Contact Information", visible: true, altKey: "Host" },
      { id: "sender", label: "Sender", visible: true, altKey: "Sender" },
      { id: "status", label: "Status", visible: true, altKey: "Status" },
      { id: "supplementTemplate", label: "Supplement Template", visible: true, altKey: "SupplementTemplate" },
      { id: "createTime", label: "Create Time", visible: true, altKey: "Created" },
      { id: "updateTime", label: "Update Time", visible: true, altKey: "updated" },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/material-replenishment/get-data`, {"email": user.email}, {
          withCredentials: true,
        });

        setTableData(response.data);
        setFilteredData(response.data);
        
        // Check if user is admin
        setIsAdmin(user.role === "admin");
        
        // Fetch global headers from backend
        try {
          const headerResponse = await axios.get(
            `${API_BASE_URL}/api/table-headers/get-material?email=${user.email}`, 
            { withCredentials: true }
          );
          
          if (headerResponse.data.headers) {
            setTableHeaders(headerResponse.data.headers);
          } else {
            const savedHeaders = localStorage.getItem('materialTableHeaders');
            if (savedHeaders) {
              try {
                setTableHeaders(JSON.parse(savedHeaders));
              } catch (e) {
                console.error("Error loading saved headers:", e);
              }
            }
          }
        } catch (headerError) {
          console.error("Error fetching table headers:", headerError);
          const savedHeaders = localStorage.getItem('materialTableHeaders');
          if (savedHeaders) {
            try {
              setTableHeaders(JSON.parse(savedHeaders));
            } catch (e) {
              console.error("Error loading saved headers:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          description: "There was an error loading the material replenishment data.",
          status: "error",
          duration: 5000,
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
    localStorage.setItem('materialTableHeaders', JSON.stringify(tableHeaders));
  }, [tableHeaders]);

  const handleAddRow = () => {
    setSelectedRowId(null);
    setNewRow({
      orderNumber: "",
      materialCategory: "",
      vendor: "",
      invitee: "",
      hostInviterContactInfo: "",
      sender: "",
      status: "",
      supplementTemplate: "",
      createTime: "",
      updateTime: "",
    });
    setIsModalOpen(true);
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row._id === rowId || row.id === rowId);
    if (selectedRow) {
      setNewRow({
        orderNumber: selectedRow.orderNumber || selectedRow.OrderNumber,
        materialCategory: selectedRow.materialCategory || selectedRow.MaterialCategory,
        vendor: selectedRow.vendor || selectedRow.Vendor,
        invitee: selectedRow.invitee || selectedRow.Invitee,
        hostInviterContactInfo: selectedRow.hostInviterContactInfo || selectedRow.Host,
        sender: selectedRow.sender || selectedRow.Sender,
        status: selectedRow.status || selectedRow.Status,
        supplementTemplate: selectedRow.supplementTemplate || selectedRow.SupplementTemplate,
        createTime: selectedRow.createTime || selectedRow.Created,
        updateTime: selectedRow.updateTime || selectedRow.updated,
      });
      setSelectedRowId(selectedRow._id || rowId);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Use the correct endpoint format that matches with your backend
      const response = await axios.post(
        `${API_BASE_URL}/api/material-replenishment/delete-data`,
        {
          id: rowToDelete,
          email: user.email
        },
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        const updatedTableData = tableData.filter((row) => row._id !== rowToDelete && row.id !== rowToDelete);
        setTableData(updatedTableData);
        setFilteredData(updatedTableData);
        
        toast({
          title: "Row deleted",
          description: "The row has been successfully deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
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
      setIsDeleteAlertOpen(false);
      setRowToDelete(null);
    }
  };

  const handleSaveRow = async () => {
    const currentDateTime = new Date().toISOString().slice(0, -8);
    
    try {
      if (selectedRowId) {
        // UPDATE EXISTING ROW
        const updatedRow = { 
          ...newRow, 
          updateTime: currentDateTime,
          updatedBy: user.email
        };
        
        // Send update request to backend using the correct endpoint and data structure
        const response = await axios.post(
          `${API_BASE_URL}/api/material-replenishment/update-data`,
          {
            id: selectedRowId,
            data: updatedRow,
            email: user.email
          },
          { withCredentials: true }
        );
        
        if (response.status === 200) {
          // Update UI
          const updatedTableData = tableData.map((row) =>
            (row._id === selectedRowId || row.id === selectedRowId) ? {
              ...row, 
              ...updatedRow,
              updatedBy: user.email
            } : row
          );
          
          setTableData(updatedTableData);
          setFilteredData(updatedTableData);
          
          toast({
            title: "Row updated",
            description: "The row has been successfully updated",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // ADD NEW ROW
        const newId = tableData.length > 0 ? Math.max(...tableData.map(row => row.id || 0)) + 1 : 1;
        const updatedRow = {
          ...newRow,
          id: newId,
          createTime: currentDateTime,
          updateTime: currentDateTime,
          createdBy: user.email,
          updatedBy: user.email
        };
        
        const response = await axios.post(
          `${API_BASE_URL}/api/material-replenishment/add-data`,
          [updatedRow, { user: user.email }],
          { withCredentials: true }
        );
        
        if (response.status === 200 || response.status === 201) {
          // Update UI with the response data or the created object
          const newRow = response.data.data || {
            ...updatedRow,
            _id: newId.toString(), // Simulate MongoDB _id for UI consistency
          };
          
          setTableData([...tableData, newRow]);
          setFilteredData([...filteredData, newRow]);
          
          toast({
            title: "Row added",
            description: "A new row has been successfully added",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error saving row:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save changes",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsModalOpen(false);
      setSelectedRowId(null);
      setNewRow({
        orderNumber: "",
        materialCategory: "",
        vendor: "",
        invitee: "",
        hostInviterContactInfo: "",
        sender: "",
        status: "",
        supplementTemplate: "",
        createTime: "",
        updateTime: "",
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

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredData(tableData);
      return;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    if (country === "All") {
      const filteredData = tableData.filter((row) =>
        Object.values(row).some(
          value => 
            value && 
            typeof value === 'string' && 
            value.toLowerCase().includes(lowercasedSearchTerm)
        )
      );
      setFilteredData(filteredData);
    } else {
      const columnKey = tableHeaders.find(h => h.label === country)?.id;
      if (columnKey) {
        const filteredData = tableData.filter(
          row => 
            row[columnKey] && 
            row[columnKey].toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredData(filteredData);
      }
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData);
  };

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Material Replenishment</Text>
            <Text fontSize="md" color="gray.400">Manage Material Replenishment</Text>
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

        <Flex justify="space-between" align="center" mb={4}>
          <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>{label}</Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex>
            <Select value={country} onChange={e => setCountry(e.target.value)} placeholder="" width={{ base: "full", md: "40" }} mr={4}>
              <option value="All">All</option>
              {tableHeaders.filter(header => header.visible).map(header => (
                <option key={header.id} value={header.label}>{header.label}</option>
              ))}
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
            <Thead bg="gray.100" height="60px">
              <Tr>
                {tableHeaders
                  .filter(header => header.visible)
                  .map(header => (
                    <Th key={header.id} color="gray.400">{header.label}</Th>
                  ))}
                <Th color="gray.400">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.map((row) => (
                <Tr key={row._id || row.id}>
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

                      if (header.id === "createTime" || header.id === "updateTime") {
                        return (
                          <Td key={header.id}>
                            {value ? new Date(value).toLocaleString() : "-"}
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
            {tableHeaders.map(header => (
              <FormControl key={header.id} width="100%" mt={4}>
                <FormLabel>{header.label}</FormLabel>
                {header.id === "status" ? (
                  <Select
                    value={newRow[header.id] || ""}
                    onChange={(e) => setNewRow({ ...newRow, [header.id]: e.target.value })}
                    placeholder="Select status"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </Select>
                ) : (
                  <Input
                    value={newRow[header.id] || ""}
                    onChange={(e) => setNewRow({ ...newRow, [header.id]: e.target.value })}
                    placeholder={`Enter ${header.label}`}
                    type={header.id === "createTime" || header.id === "updateTime" ? "datetime-local" : "text"}
                  />
                )}
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

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Material Replenishment Entry Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDetails && (
              <Stack spacing={4}>
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Text fontWeight="bold" mb={2}>Entry Information</Text>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created by:</Text>
                    <Text>{selectedDetails.createdBy || selectedDetails.user || "Unknown"}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="semibold" width="120px">Created on:</Text>
                    <Text>
                      {selectedDetails.createTime || selectedDetails.Created
                          ? new Date(selectedDetails.createTime || selectedDetails.Created).toLocaleString()
                          : "Unknown date"}
                      </Text>
                    </Flex>
                  </Box>
                  
                  {(selectedDetails.updateTime || selectedDetails.updated) && (
                    <Box borderWidth="1px" borderRadius="lg" p={4} bg="blue.50">
                      <Text fontWeight="bold" mb={2}>Last Update</Text>
                      <Flex>
                        <Text fontWeight="semibold" width="120px">Updated by:</Text>
                        <Text>{selectedDetails.updatedBy || selectedDetails.user || "Unknown"}</Text>
                      </Flex>
                      <Flex>
                        <Text fontWeight="semibold" width="120px">Updated on:</Text>
                        <Text>
                          {new Date(selectedDetails.updateTime || selectedDetails.updated).toLocaleString()}
                        </Text>
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

  export default MaterialReplenishment;