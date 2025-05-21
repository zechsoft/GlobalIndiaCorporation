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

// API base URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

// Default table headers configuration
const DEFAULT_HEADERS = [
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
];

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorScheme;
  switch (status) {
    case "Complete":
    case "Completed":
    case "Delivered":
    case "Accepted":
      colorScheme = "green";
      break;
    case "Pending":
      colorScheme = "yellow";
      break;
    case "Cancelled":
    case "Rejected":
      colorScheme = "red";
      break;
    case "In Transit":
    case "Processing":
      colorScheme = "blue";
      break;
    case "Delayed":
      colorScheme = "orange";
      break;
    case "New":
      colorScheme = "purple";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const CustomerOrder = () => {
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
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const localStorageUser = localStorage.getItem("user");
      const sessionStorageUser = sessionStorage.getItem("user");
      return JSON.parse(localStorageUser || sessionStorageUser || "null");
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  });
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
    acceptanceStatus: "Pending",
    statementStatus: "Pending",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);

  const searchInputRef = useRef(null);
  const cancelRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const toast = useToast();
  const navigate = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.email) {
          console.error("User data is missing");
          toast({
            title: "Authentication required",
            description: "Please login to access this data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/customer/get-data`,
          { email: user.email },
          { withCredentials: true }
        );

        if (response.data && Array.isArray(response.data)) {
          const dataWithId = response.data.map(item => ({
            ...item,
            id: item._id
          }));
          setTableData(dataWithId);
          setFilteredData(dataWithId);
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
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching data",
          description: error.response?.data?.error || error.message || "Failed to fetch data from server",
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
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === "admin");
      
      const savedHeaders = localStorage.getItem('customerOrderTableHeaders');
      if (savedHeaders) {
        try {
          setTableHeaders(JSON.parse(savedHeaders));
        } catch (e) {
          console.error("Error loading saved headers:", e);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('customerOrderTableHeaders', JSON.stringify(tableHeaders));
  }, [tableHeaders]);

  const handleViewDetails = (row) => {
    setSelectedRowDetails(row);
    setIsViewModalOpen(true);
  };

  const handleAddRow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsModalOpen(true);
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
      acceptanceStatus: "Pending",
      statementStatus: "Pending",
    });
  };

  const handleEditRow = (rowId) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to edit data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const selectedRow = tableData.find((row) => row.id === rowId || row._id === rowId);
    if (selectedRow) {
      setNewRow({
        ...selectedRow,
        deliveryStatus: selectedRow.deliveryStatus || "Pending",
        orderStatus: selectedRow.orderStatus || "Processing",
        acceptanceStatus: selectedRow.acceptanceStatus || "Pending",
        statementStatus: selectedRow.statementStatus || "Pending"
      });
      setSelectedRowId(rowId);
      setIsModalOpen(true);
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveRow = async() => {
    try {
      if (!user || !user.email) {
        throw new Error("User authentication required");
      }

      // Ensure required enum fields have valid values
      const validatedNewRow = {
        ...newRow,
        deliveryStatus: newRow.deliveryStatus || "Pending",
        orderStatus: newRow.orderStatus || "Processing",
        acceptanceStatus: newRow.acceptanceStatus || "Pending",
        statementStatus: newRow.statementStatus || "Pending"
      };

      if (selectedRowId) {
        // Update existing row
        const updatedRow = { ...validatedNewRow, id: selectedRowId };
        await axios.post(`${API_BASE_URL}/api/customer/update-data`, 
          { data: updatedRow, email: user.email },
          { withCredentials: true }
        );
        
        // Refresh user data after update
        const getResponse = await axios.post(
          `${API_BASE_URL}/api/customer/get-data`,
          { email: user.email },
          { withCredentials: true }
        );
        
        const dataWithId = getResponse.data.map(item => ({
          ...item,
          id: item._id
        }));
        
        setTableData(dataWithId);
        setFilteredData(dataWithId);
        
        toast({
          title: "Row updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new row
        const dataToSend = [
          {
            customerNumber: validatedNewRow.customerNumber,
            customer: validatedNewRow.customer,
            buyer: validatedNewRow.buyer,
            platformNo: validatedNewRow.platformNo,
            poNo: validatedNewRow.poNo,
            purchaseDate: validatedNewRow.purchaseDate,
            orderAmount: validatedNewRow.orderAmount,
            currency: validatedNewRow.currency,
            purchasingDepartment: validatedNewRow.purchasingDepartment,
            purchaser: validatedNewRow.purchaser,
            requisitionBusinessGroup: validatedNewRow.requisitionBusinessGroup,
            deliveryStatus: validatedNewRow.deliveryStatus,
            orderStatus: validatedNewRow.orderStatus,
            acceptanceStatus: validatedNewRow.acceptanceStatus,
            statementStatus: validatedNewRow.statementStatus,
          },
          { user: user.email }
        ];
        
        await axios.post(`${API_BASE_URL}/api/customer/add-data`,
          dataToSend,
          { withCredentials: true }
        );
        
        // Refresh user data after add
        const getResponse = await axios.post(
          `${API_BASE_URL}/api/customer/get-data`,
          { email: user.email },
          { withCredentials: true }
        );
        
        const dataWithId = getResponse.data.map(item => ({
          ...item,
          id: item._id
        }));
        
        setTableData(dataWithId);
        setFilteredData(dataWithId);
        
        toast({
          title: "Row added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch(err) {
      console.error("Error saving data:", err);
      toast({
        title: "Error saving data",
        description: err.response?.data?.error || err.message || "Failed to save data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsModalOpen(false);
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
        acceptanceStatus: "Pending",
        statementStatus: "Pending",
      });
      setSelectedRowId(null);
    }
  };

  const confirmDelete = async () => {
    try {
      const rowToDeleteItem = tableData.find(row => row.id === rowToDelete || row._id === rowToDelete);
      
      if (!rowToDeleteItem) {
        throw new Error("Row not found");
      }
      
      const mongoId = rowToDeleteItem._id || rowToDeleteItem.id;
      
      await axios.post(`${API_BASE_URL}/api/customer/delete-data`, 
        { id: mongoId, email: user.email },
        { withCredentials: true }
      );
      
      const response = await axios.post(
        `${API_BASE_URL}/api/customer/get-data`,
        { email: user.email },
        { withCredentials: true }
      );
      
      if (response.data && Array.isArray(response.data)) {
        const dataWithId = response.data.map(item => ({
          ...item,
          id: item._id
        }));
        setTableData(dataWithId);
        setFilteredData(dataWithId);
      }
      
      toast({
        title: "Row deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error deleting row",
        description: error.response?.data?.message || error.message || "Failed to delete row",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setRowToDelete(null);
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
      localStorage.setItem('customerOrderTableHeaders', JSON.stringify(tempHeaders));
      
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
    
    const newHeader = {
      id: newHeaderInfo.id,
      label: newHeaderInfo.label,
      visible: true,
    };
    
    setTempHeaders([...tempHeaders, newHeader]);
    setIsAddHeaderModalOpen(false);
    
    setNewHeaderInfo({
      id: "",
      label: "",
      visible: true,
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
            <Text fontSize="xl" fontWeight="bold">Customer Orders</Text>
            <Text fontSize="md" color="gray.400">Manage Customer Orders</Text>
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
                <Tr key={row._id || row.id}>
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => {
                      const value = row[header.id] || "";

                      if (header.id === "deliveryStatus" || header.id === "orderStatus" || 
                          header.id === "acceptanceStatus" || header.id === "statementStatus") {
                        return (
                          <Td key={header.id}>
                            {getStatusBadge(value)}
                          </Td>
                        );
                      }
                      
                      if (header.id === "purchaseDate" && value) {
                        return (
                          <Td key={header.id}>
                            {new Date(value).toLocaleDateString()}
                          </Td>
                        );
                      }
                      
                      if (header.id === "orderAmount" && value) {
                        return (
                          <Td key={header.id} isNumeric>
                            {Number(value).toLocaleString(undefined, {
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2
                            })}
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
                      {isAdmin && (
                        <Tooltip label="Delete">
                          <IconButton
                            variant="outline"
                            colorScheme="red"
                            aria-label="Delete"
                            icon={<TrashIcon style={{ width: "14px", height: "14px" }} />}
                            size="xs"
                            onClick={() => handleDeleteRow(row._id || row.id)}
                          />
                        </Tooltip>
                      )}
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
          <ModalHeader>{selectedRowId ? "Edit Customer Order" : "Add New Customer Order"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl width="100%" mt={4} key="customerNumber">
              <FormLabel>Customer Number</FormLabel>
              <Input
                value={newRow.customerNumber || ""}
                onChange={(e) => setNewRow({ ...newRow, customerNumber: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="customer">
              <FormLabel>Customer</FormLabel>
              <Input
                value={newRow.customer || ""}
                onChange={(e) => setNewRow({ ...newRow, customer: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="buyer">
              <FormLabel>Buyer</FormLabel>
              <Input
                value={newRow.buyer || ""}
                onChange={(e) => setNewRow({ ...newRow, buyer: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="platformNo">
              <FormLabel>Platform No</FormLabel>
              <Input
                value={newRow.platformNo || ""}
                onChange={(e) => setNewRow({ ...newRow, platformNo: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="poNo">
              <FormLabel>PO No</FormLabel>
              <Input
                value={newRow.poNo || ""}
                onChange={(e) => setNewRow({ ...newRow, poNo: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="purchaseDate">
              <FormLabel>Purchase Date</FormLabel>
              <Input
                type="date"
                value={newRow.purchaseDate || ""}
                onChange={(e) => setNewRow({ ...newRow, purchaseDate: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="orderAmount">
              <FormLabel>Order Amount</FormLabel>
              <Input
                type="number"
                value={newRow.orderAmount || ""}
                onChange={(e) => setNewRow({ ...newRow, orderAmount: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="purchasingDepartment">
              <FormLabel>Purchasing Department</FormLabel>
              <Input
                value={newRow.purchasingDepartment || ""}
                onChange={(e) => setNewRow({ ...newRow, purchasingDepartment: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="purchaser">
              <FormLabel>Purchaser</FormLabel>
              <Input
                value={newRow.purchaser || ""}
                onChange={(e) => setNewRow({ ...newRow, purchaser: e.target.value })}
              />
            </FormControl>

            <FormControl width="100%" mt={4} key="requisitionBusinessGroup">
              <FormLabel>Requisition Business Group</FormLabel>
              <Input
                value={newRow.requisitionBusinessGroup || ""}
                onChange={(e) => setNewRow({ ...newRow, requisitionBusinessGroup: e.target.value })}
              />
            </FormControl>

            {/* Modal form fields for delivery status, order status, and acceptance status */}
            <FormControl width="100%" mt={4} key="deliveryStatus">
              <FormLabel>Delivery Status</FormLabel>
              <Select
                value={newRow.deliveryStatus || "Pending"}
                onChange={(e) => setNewRow({ ...newRow, deliveryStatus: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Complete">Complete</option>
                <option value="Cancelled">Cancelled</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </Select>
            </FormControl>

            <FormControl width="100%" mt={4} key="orderStatus">
              <FormLabel>Order Status</FormLabel>
              <Select
                value={newRow.orderStatus || "Processing"}
                onChange={(e) => setNewRow({ ...newRow, orderStatus: e.target.value })}
              >
                <option value="Processing">Processing</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="New">New</option>
                <option value="Completed">Completed</option>
              </Select>
            </FormControl>

            <FormControl width="100%" mt={4} key="acceptanceStatus">
              <FormLabel>Acceptance Status</FormLabel>
              <Select
                value={newRow.acceptanceStatus || "Pending"}
                onChange={(e) => setNewRow({ ...newRow, acceptanceStatus: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </FormControl>

            <FormControl width="100%" mt={4} key="statementStatus">
              <FormLabel>Statement Status</FormLabel>
              <Input
                value={newRow.statementStatus || "Pending"}
                onChange={(e) => setNewRow({ ...newRow, statementStatus: e.target.value })}
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
              Delete Customer Order
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this customer order? This action cannot be undone.
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

export default CustomerOrder;