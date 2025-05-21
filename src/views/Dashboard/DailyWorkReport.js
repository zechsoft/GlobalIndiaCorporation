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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { HamburgerIcon } from "@chakra-ui/icons";
import { CogIcon } from "@heroicons/react/24/solid";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Updated API base URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

const TABS = [
  { label: "All", value: "all" },
  { label: "Monitored", value: "monitored" },
  { label: "Unmonitored", value: "unmonitored" },
];

// Default table headers configuration for Daily Work Report
const DEFAULT_DAILY_WORK_HEADERS = [
  { id: "srNo", label: "Sr.No.", visible: true },
  { id: "companyName", label: "Company Name", visible: true, altKey: "CompanyName" },
  { id: "projectName", label: "Project Name", visible: true, altKey: "ProjectName" },
  { id: "date", label: "Date", visible: true, altKey: "Date" },
  { id: "supervisorName", label: "Supervisor Name", visible: true, altKey: "SupervisorName" },
  { id: "managerName", label: "Manager Name", visible: true, altKey: "ManagerName" },
  { id: "prepaidBy", label: "Prepared By", visible: true, altKey: "PrepaidBy" },
  { id: "employees", label: "No. of Employee", visible: true, altKey: "Employee" },
  { id: "workType", label: "Nature of Work", visible: true, altKey: "NatureOfWork" },
  { id: "progress", label: "Progress", visible: true, altKey: "Progress" },
  { id: "hours", label: "Hour of Work", visible: true, altKey: "HourOfWork" }
];

const DailyWorkReport = () => {
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const toast = useToast();
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRow, setNewRow] = useState({
    companyName: "",
    projectName: "",
    supervisorName: "",
    managerName: "",
    prepaidBy: "",
    employees: "",
    workType: "",
    progress: "",
    hours: "",
    charges: "",
    date: "",
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableHeaders, setTableHeaders] = useState(DEFAULT_DAILY_WORK_HEADERS);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [tempHeaders, setTempHeaders] = useState([]);
  const [editingHeader, setEditingHeader] = useState(null);
  const [newHeaderName, setNewHeaderName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isAddHeaderModalOpen, setIsAddHeaderModalOpen] = useState(false);
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: "",
    label: "",
    visible: true,
    altKey: ""
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);

  const searchInputRef = useRef(null);
  const cancelRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetchData();
    // Check if user is admin
    setIsAdmin(user?.role === "admin");
    
    // Fetch table headers
    fetchDailyWorkHeaders();
  }, []);

  const fetchDailyWorkHeaders = async () => {
    try {
      if (!user?.email) {
        console.warn("No user email found, cannot fetch personalized headers");
        // Fall back to default headers or handle this case
        const savedHeaders = localStorage.getItem('dailyWorkerTableHeaders');
        if (savedHeaders) {
          setTableHeaders(JSON.parse(savedHeaders));
        } else {
          setTableHeaders(DEFAULT_DAILY_WORK_HEADERS);
        }
        return;
      }
      
      // First try to get from API
      const headerResponse = await axios.get(
        `${API_BASE_URL}/api/table-headers/get-daily-work?email=${user.email}`, 
        { withCredentials: true }
      );
      
      if (headerResponse.data.headers) {
        setTableHeaders(headerResponse.data.headers);
        // Also save to localStorage as backup
        localStorage.setItem('dailyWorkerTableHeaders', JSON.stringify(headerResponse.data.headers));
      } else {
        // If API doesn't return headers, check localStorage
        const savedHeaders = localStorage.getItem('dailyWorkerTableHeaders');
        if (savedHeaders) {
          try {
            setTableHeaders(JSON.parse(savedHeaders));
          } catch (e) {
            console.error("Error loading saved daily work headers:", e);
            setTableHeaders(DEFAULT_DAILY_WORK_HEADERS);
          }
        } else {
          setTableHeaders(DEFAULT_DAILY_WORK_HEADERS);
        }
      }
    } catch (error) {
      console.error("Error fetching daily work table headers:", error);
      // Check localStorage in case of API failure
      const savedHeaders = localStorage.getItem('dailyWorkerTableHeaders');
      if (savedHeaders) {
        try {
          setTableHeaders(JSON.parse(savedHeaders));
        } catch (e) {
          console.error("Error loading saved headers:", e);
          setTableHeaders(DEFAULT_DAILY_WORK_HEADERS);
        }
      } else {
        setTableHeaders(DEFAULT_DAILY_WORK_HEADERS);
      }
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/dailywork/get-data`, 
        {"email": user.email}, 
        { withCredentials: true }
      );

      // Transform data to match our component's expected format
      const formattedData = response.data.map((item, index) => ({
        id: index + 1,
        srNo: index + 1,
        companyName: item.CompanyName,
        projectName: item.ProjectName,
        supervisorName: item.SupervisorName,
        managerName: item.ManagerName,
        prepaidBy: item.PrepaidBy,
        employees: item.Employee,
        workType: item.NatureofWork,
        progress: item.Progress,
        hours: item.HourofWork,
        charges: item.Charges || "0",
        date: item.Date,
        user: item.user,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        updatedBy: item.updatedBy
      }));

      setTableData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load daily work reports",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveHeaderChanges = async () => {
    try {
      if (!user?.email) {
        toast({
          title: "Error",
          description: "User email not available",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (isAdmin) {
        await axios.post(`${API_BASE_URL}/api/table-headers/update-daily-work`, 
          { 
            headers: tempHeaders,
            email: user.email,
            isGlobal: true
          },
          { withCredentials: true }
        );
        
        toast({
          title: "Daily Work Report headers updated globally",
          description: "All users will see your changes",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        // For regular users, update their personal settings
        await axios.post(`${API_BASE_URL}/api/table-headers/update-daily-work`, 
          { 
            headers: tempHeaders,
            email: user.email,
            isGlobal: false
          },
          { withCredentials: true }
        );
        
        toast({
          title: "Your table headers have been updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
      
      setTableHeaders(tempHeaders);
      setIsHeaderModalOpen(false);
      
      // Store in localStorage with daily work specific key
      localStorage.setItem('dailyWorkerTableHeaders', JSON.stringify(tempHeaders));
      
    } catch (error) {
      console.error("Error saving daily work header changes:", error);
      toast({
        title: "Error saving header changes",
        description: error.response?.data?.message || "Failed to update table headers",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewDetails = (row) => {
    setSelectedReportDetails(row);
    setIsViewModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newRow.companyName) errors.companyName = "Company name is required";
    if (!newRow.projectName) errors.projectName = "Project name is required";
    if (!newRow.date) errors.date = "Date is required";
    
    if (newRow.employees && isNaN(Number(newRow.employees))) {
      errors.employees = "Must be a number";
    }
    
    if (newRow.progress && (isNaN(Number(newRow.progress)) || Number(newRow.progress) < 0 || Number(newRow.progress) > 100)) {
      errors.progress = "Must be a number between 0-100";
    }
    
    if (newRow.hours && isNaN(Number(newRow.hours))) {
      errors.hours = "Must be a number";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRow = () => {
    setIsModalOpen(true);
    setSelectedRowId(null);
    setNewRow({
      companyName: "",
      projectName: "",
      supervisorName: "",
      managerName: "",
      prepaidBy: "",
      employees: "",
      workType: "",
      progress: "",
      hours: "",
      charges: "",
      date: "",
    });
    setFieldErrors({});
  };

  const handleEditRow = (rowId) => {
    const selectedRow = tableData.find((row) => row.id === rowId);
    if (selectedRow) {
      setNewRow({...selectedRow});
      setSelectedRowId(rowId);
      setIsModalOpen(true);
      setFieldErrors({});
    }
  };

  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // First delete from backend
      await axios.post(
        `${API_BASE_URL}/api/dailywork/delete-data`,
        { id: rowToDelete, user: user.email },
        { withCredentials: true }
      );

      // Then update UI
      const updatedTableData = tableData.filter((row) => row.id !== rowToDelete);
      setTableData(updatedTableData);
      setFilteredData(updatedTableData);
      
      toast({
        title: "Report deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
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
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (selectedRowId) {
        // This is for updating an existing report
        // Format the data as expected by the backend API
        const formattedData = [
          {
            CompanyName: newRow.companyName,
            ProjectName: newRow.projectName,
            SupervisorName: newRow.supervisorName,
            ManagerName: newRow.managerName,
            PrepaidBy: newRow.prepaidBy,
            Employee: newRow.employees,
            NatureofWork: newRow.workType,
            Progress: newRow.progress,
            HourofWork: newRow.hours,
            Charges: newRow.charges || "0",
            Date: newRow.date,
            id: selectedRowId
          },
          {
            user: user.email
          }
        ];
        
        const response = await axios.post(
          `${API_BASE_URL}/api/dailywork/update-data`, 
          formattedData, 
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Update the row in the UI
          const updatedRow = { 
            ...newRow, 
            id: selectedRowId,
            updatedAt: new Date(),
            updatedBy: user.email 
          };
          
          const updatedTableData = tableData.map((row) =>
            row.id === selectedRowId ? updatedRow : row
          );
          
          setTableData(updatedTableData);
          setFilteredData(updatedTableData);
          
          toast({
            title: "Report Updated",
            description: "Work report updated successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // This is for adding a new report
        // Make sure date is properly formatted as YYYY-MM-DD
        const formattedDate = newRow.date;
        
        const formattedData = [
          {
            CompanyName: newRow.companyName,
            ProjectName: newRow.projectName,
            SupervisorName: newRow.supervisorName,
            ManagerName: newRow.managerName,
            PrepaidBy: newRow.prepaidBy,
            Employee: newRow.employees,
            NatureofWork: newRow.workType,
            Progress: newRow.progress,
            HourofWork: newRow.hours,
            Charges: newRow.charges || "0",
            Date: formattedDate
          },
          {
            user: user.email
          }
        ];
        
        const response = await axios.post(
          `${API_BASE_URL}/api/dailywork/add-data`, 
          formattedData, 
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Create a new row with the response data
          const newRecord = response.data.data;
          const newRow = { 
            id: tableData.length + 1,
            srNo: tableData.length + 1,
            companyName: newRecord.CompanyName,
            projectName: newRecord.ProjectName,
            supervisorName: newRecord.SupervisorName,
            managerName: newRecord.ManagerName,
            prepaidBy: newRecord.PrepaidBy,
            employees: newRecord.Employee,
            workType: newRecord.NatureofWork,
            progress: newRecord.Progress,
            hours: newRecord.HourofWork,
            charges: newRecord.Charges,
            date: newRecord.Date,
            user: newRecord.user,
            createdAt: newRecord.createdAt
          };
          
          const updatedTableData = [...tableData, newRow];
          setTableData(updatedTableData);
          setFilteredData(updatedTableData);
          
          toast({
            title: "Report Added",
            description: "Work report added successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
      
      setIsModalOpen(false);
      setSelectedRowId(null);
      setNewRow({
        companyName: "",
        projectName: "",
        supervisorName: "",
        managerName: "",
        prepaidBy: "",
        employees: "",
        workType: "",
        progress: "",
        hours: "",
        charges: "",
        date: "",
      });
    } catch(error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save data. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredData(tableData);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    if (country === "All") {
      const filtered = tableData.filter((row) =>
        row.employees?.toString().includes(lowerSearchTerm) ||
        row.workType?.toLowerCase().includes(lowerSearchTerm) ||
        row.progress?.toString().includes(lowerSearchTerm) ||
        row.companyName?.toLowerCase().includes(lowerSearchTerm) ||
        row.projectName?.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredData(filtered);
    } else {
      const filtered = tableData.filter((row) => {
        switch (country) {
          case "No. of Employees":
            return row.employees?.toString().includes(lowerSearchTerm);
          case "Nature of Work":
            return row.workType?.toLowerCase().includes(lowerSearchTerm);
          case "Progress":
            return row.progress?.toString().includes(lowerSearchTerm);
          default:
            return true;
        }
      });
      setFilteredData(filtered);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("All");
    setFilteredData(tableData);
  };

  const handleInputChange = (field, value) => {
    setNewRow({ ...newRow, [field]: value });
    
    if (fieldErrors[field]) {
      setFieldErrors({
        ...fieldErrors,
        [field]: null
      });
    }
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
    setTempHeaders([...DEFAULT_DAILY_WORK_HEADERS]);
  };

  return (
    <Box mt={16}>
      <Flex direction="column" bg="white" p={6} boxShadow="md" borderRadius="15px" width="100%">
        <Flex justify="space-between" mb={8}>
          <Flex direction="column">
            <Text fontSize="xl" fontWeight="bold">Daily Work Report</Text>
            <Text fontSize="md" color="gray.400">See information about daily work reports</Text>
          </Flex>
          <Flex direction="row" gap={2}>
            <Button size="sm" onClick={() => history.push("/admin/tables")} mr={2}>View All</Button>
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
            <Button 
              size="sm" 
              colorScheme="blue" 
              leftIcon={<UserPlusIcon style={{ height: "16px", width: "16px" }} />} 
              onClick={handleAddRow}
              isLoading={isLoading}
            >
              Add Report
            </Button>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center" mb={4} flexDirection={["column", "column", "row"]} gap={4}>
          <Tabs defaultIndex={0} className="w-full md:w-max" isLazy>
            <TabList>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value}>{label}</Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex flexDirection={["column", "row"]} width={["100%", "auto"]} gap={2}>
            <Select 
              value={country} 
              onChange={e => setCountry(e.target.value)} 
              placeholder="" 
              width={["100%", "auto"]} 
              mr={[0, 4]}
            >
              <option value="All">All</option>
              <option value="No. of Employees">No. of Employees</option>
              <option value="Nature of Work">Nature of Work</option>
              <option value="Progress">Progress</option>
            </Select>
            <FormControl width={["100%", "auto"]} mr={[0, 4]}>
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
                  placeholder="Search here"
                  borderColor={isFocused ? "green.500" : "gray.300"}
                  _focus={{
                    borderColor: "green.500",
                    boxShadow: "0 0 0 1px green.500",
                  }}
                />
              </InputGroup>
            </FormControl>
            <Flex gap={2}>
              <Button colorScheme="blue" onClick={handleSearch} isLoading={isLoading}>Search</Button>
              <Button variant="outline" onClick={handleClear}>Clear</Button>
            </Flex>
          </Flex>
        </Flex>

        <Box overflowX="auto">
          {isLoading ? (
            <Flex justify="center" align="center" height="200px">
              <Text>Loading data...</Text>
            </Flex>
          ) : filteredData.length > 0 ? (
            <Table variant="simple" borderRadius="10px">
              <Thead bg="gray.100" height="60px">
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
                      .map(header => (
                        <Td key={header.id}>
                          {header.altKey 
                            ? (row[header.id] || row[header.altKey] || "") 
                            : (row[header.id] || "")}
                        </Td>
                      ))}
                    <Td>
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
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Flex justify="center" align="center" height="200px">
              <Text>No reports found</Text>
            </Flex>
          )}
        </Box>

        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="sm">Page {currentPage} of {Math.ceil(filteredData.length / 10) || 1}</Text>
          <Flex>
            <Button 
              size="sm" 
              variant="outline" 
              mr={2} 
              isDisabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              isDisabled={currentPage >= Math.ceil(filteredData.length / 10)}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Add/Edit Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Work Report" : "Add New Work Report"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!fieldErrors.companyName} isRequired>
              <FormLabel>Company Name</FormLabel>
              <Input
                value={newRow.companyName || ""}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter company name"
              />
              {fieldErrors.companyName && (
                <Text color="red.500" fontSize="sm" mt={1}>{fieldErrors.companyName}</Text>
              )}
            </FormControl>
            
            <FormControl mt={4} isInvalid={!!fieldErrors.projectName} isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input
                value={newRow.projectName || ""}
                onChange={(e) => handleInputChange("projectName", e.target.value)}
                placeholder="Enter project name"
              />
              {fieldErrors.projectName && (
                <Text color="red.500" fontSize="sm" mt={1}>{fieldErrors.projectName}</Text>
              )}
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Supervisor Name</FormLabel>
              <Input
                value={newRow.supervisorName || ""}
                onChange={(e) => handleInputChange("supervisorName", e.target.value)}
                placeholder="Enter supervisor name"
              />
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Manager Name</FormLabel>
              <Input
                value={newRow.managerName || ""}
                onChange={(e) => handleInputChange("managerName", e.target.value)}
                placeholder="Enter manager name"
              />
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Prepaid By</FormLabel>
              <Input
                value={newRow.prepaidBy || ""}
                onChange={(e) => handleInputChange("prepaidBy", e.target.value)}
                placeholder="Enter prepaid by"
              />
            </FormControl>
            
            <FormControl mt={4} isInvalid={!!fieldErrors.employees}>
              <FormLabel>No. of Employee</FormLabel>
              <Input
                value={newRow.employees || ""}
                onChange={(e) => handleInputChange("employees", e.target.value)}
                placeholder="Enter number of employees"
                type="number"
              />
              {fieldErrors.employees && (
                <Text color="red.500" fontSize="sm" mt={1}>{fieldErrors.employees}</Text>
              )}
            </FormControl>
            
            <FormControl mt={4}>
              <FormLabel>Nature of Work</FormLabel>
              <Input
                value={newRow.workType || ""}
                onChange={(e) => handleInputChange("workType", e.target.value)}
                placeholder="Enter nature of work"
              />
            </FormControl>
            
            <FormControl mt={4} isInvalid={!!fieldErrors.progress}>
              <FormLabel>Progress (%)</FormLabel>
              <Input
                value={newRow.progress || ""}
                onChange={(e) => handleInputChange("progress", e.target.value)}
                placeholder="Enter progress percentage"
                type="number"
                min="0"
                max="100"
              />
              {fieldErrors.progress && (
                <Text color="red.500" fontSize="sm" mt={1}>{fieldErrors.progress}</Text>
              )}
            </FormControl>
            
            <FormControl mt={4} isInvalid={!!fieldErrors.hours}>
              <FormLabel>Hour of Work</FormLabel>
              <Input
                value={newRow.hours || ""}
                onChange={(e) => handleInputChange("hours", e.target.value)}
                placeholder="Enter hours of work"
                type="number"
                min="0"
              />
              {fieldErrors.hours && (
                <Text color="red.500" fontSize="sm" mt={1}>{fieldErrors.hours}</Text>
              )}
            </FormControl>
            
            <FormControl mt={4} display="none">
              <FormLabel>Charges</FormLabel>
              <Input
                value={newRow.charges || ""}
                onChange={(e) => handleInputChange("charges", e.target.value)}
              />
            </FormControl>
            
            <FormControl mt={4} isInvalid={!!fieldErrors.date} isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={newRow.date || ""}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
              {fieldErrors.date && (
                <Text color="red.500" fontSize="sm" mt={1}>{fieldErrors.date}</Text>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue"  
              mr={3} 
              onClick={handleSaveRow}
              isLoading={isLoading}
            >
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
          <ModalHeader>Work Report Details</ModalHeader>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Work Report
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this work report? This action cannot be undone.
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

export default DailyWorkReport;