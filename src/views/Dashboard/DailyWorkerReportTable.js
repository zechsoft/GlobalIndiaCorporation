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

// Define API base URL
const API_BASE_URL = "https://globalindiabackendnew.onrender.com";

// Progress badge styling helper
const getProgressBadge = (progress) => {
  let colorScheme;
  switch (progress) {
    case "Completed":
      colorScheme = "green";
      break;
    case "In Progress":
      colorScheme = "blue";
      break;
    case "Not Started":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }
  return <Badge colorScheme={colorScheme}>{progress}</Badge>;
};

const DailyWorkerReportTable = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgress, setFilterProgress] = useState("All");
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
    companyName: "",
    projectName: "",
    date: "",
    supervisorName: "",
    managerName: "",
    prepaidBy: "",
    employees: "",
    workType: "",
    progress: "In Progress",
    hours: "",
    charges: ""
  });

  // Table headers (simplified without management options)
  const tableHeaders = [
    { id: "srNo", label: "Sr.No." },
    { id: "companyName", label: "Company Name", altKey: "CompanyName" },
    { id: "projectName", label: "Project Name", altKey: "ProjectName" },
    { id: "date", label: "Date", altKey: "Date" },
    { id: "supervisorName", label: "Supervisor Name", altKey: "SupervisorName" },
    { id: "managerName", label: "Manager Name", altKey: "ManagerName" },
    { id: "prepaidBy", label: "Prepared By", altKey: "PrepaidBy" },
    { id: "employees", label: "No. of Employee", altKey: "Employee" },
    { id: "workType", label: "Nature of Work", altKey: "NatureOfWork" },
    { id: "progress", label: "Progress", altKey: "Progress" },
    { id: "hours", label: "Hour of Work", altKey: "HourOfWork" }
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

  // Fetch report data
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dailywork/get-all`, {
          withCredentials: true
        });
        
        // Map _id to id for consistency and add serial numbers
        const dataWithIds = response.data.data.map((item, index) => ({
          ...item,
          id: item._id,
          srNo: index + 1,
          companyName: item.CompanyName,
          projectName: item.ProjectName,
          date: item.Date,
          supervisorName: item.SupervisorName,
          managerName: item.ManagerName,
          prepaidBy: item.PrepaidBy,
          employees: item.Employee,
          workType: item.NatureOfWork,
          progress: item.Progress,
          hours: item.HourOfWork,
          charges: item.Charges || "0"
        }));
        
        setReports(dataWithIds);
        setFilteredReports(dataWithIds);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.response?.data?.message || "Failed to fetch report data");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: `Failed to fetch report data: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (currentUser) {
      fetchReports();
    }
  }, [currentUser, toast]);

  // Apply filters when search term or filter status changes
  useEffect(() => {
    let results = reports;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(report => 
        (report.companyName && report.companyName.toLowerCase().includes(term)) ||
        (report.projectName && report.projectName.toLowerCase().includes(term)) ||
        (report.supervisorName && report.supervisorName.toLowerCase().includes(term)) ||
        (report.managerName && report.managerName.toLowerCase().includes(term))
      );
    }
    
    // Apply progress filter
    if (filterProgress !== "All") {
      results = results.filter(report => report.progress === filterProgress);
    }
    
    setFilteredReports(results);
  }, [searchTerm, filterProgress, reports]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProgress]);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Row management functions
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
    
    setSelectedRowId(null);
    setNewRow({
      companyName: "",
      projectName: "",
      date: "",
      supervisorName: "",
      managerName: "",
      prepaidBy: "",
      employees: "",
      workType: "",
      progress: "In Progress",
      hours: "",
      charges: ""
    });
    onModalOpen();
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
    
    const selectedRow = reports.find(row => row.id === rowId);
    if (selectedRow) {
      setNewRow({
        ...selectedRow,
        companyName: selectedRow.companyName || selectedRow.CompanyName || "",
        projectName: selectedRow.projectName || selectedRow.ProjectName || "",
        date: selectedRow.date || selectedRow.Date || "",
        supervisorName: selectedRow.supervisorName || selectedRow.SupervisorName || "",
        managerName: selectedRow.managerName || selectedRow.ManagerName || "",
        prepaidBy: selectedRow.prepaidBy || selectedRow.PrepaidBy || "",
        employees: selectedRow.employees || selectedRow.Employee || "",
        workType: selectedRow.workType || selectedRow.NatureOfWork || "",
        progress: selectedRow.progress || selectedRow.Progress || "In Progress",
        hours: selectedRow.hours || selectedRow.HourOfWork || "",
        charges: selectedRow.charges || "0"
      });
      setSelectedRowId(rowId);
      onModalOpen();
    }
  };

  const handleDeleteRow = (rowId) => {
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
    
    setRowToDelete(rowId);
    onDeleteOpen();
  };

  const handleViewDetails = (row) => {
    // Implement view details functionality if needed
    console.log("View details for row:", row);
    toast({
      title: "View Details",
      description: `Viewing details for report ${row.companyName} - ${row.projectName}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSaveRow = async () => {
    try {
      if (!currentUser || !currentUser.email) {
        throw new Error("User authentication required");
      }

      // Map the frontend data structure to match backend expectations
      const rowData = {
        CompanyName: newRow.companyName || "",
        ProjectName: newRow.projectName || "",
        Date: newRow.date || "",
        SupervisorName: newRow.supervisorName || "",
        ManagerName: newRow.managerName || "",
        PrepaidBy: newRow.prepaidBy || "",
        Employee: newRow.employees || "",
        NatureOfWork: newRow.workType || "",
        Progress: newRow.progress || "In Progress",
        HourOfWork: newRow.hours || "",
        Charges: newRow.charges || "0"
      };

      if (selectedRowId) {
        // Update existing row
        await axios.put(
          `${API_BASE_URL}/api/dailywork/update/${selectedRowId}`,
          rowData,
          { withCredentials: true }
        );
      } else {
        // Add new row
        await axios.post(
          `${API_BASE_URL}/api/dailywork/add-data`,
          [rowData, { user: currentUser.email }],
          { withCredentials: true }
        );
      }

      // Refresh data
      const response = await axios.get(`${API_BASE_URL}/api/dailywork/get-all`, {
        withCredentials: true
      });
      
      const dataWithIds = response.data.data.map((item, index) => ({
        ...item,
        id: item._id,
        srNo: index + 1,
        companyName: item.CompanyName,
        projectName: item.ProjectName,
        date: item.Date,
        supervisorName: item.SupervisorName,
        managerName: item.ManagerName,
        prepaidBy: item.PrepaidBy,
        employees: item.Employee,
        workType: item.NatureOfWork,
        progress: item.Progress,
        hours: item.HourOfWork,
        charges: item.Charges || "0"
      }));
      
      setReports(dataWithIds);
      setFilteredReports(dataWithIds);
      
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
      if (!currentUser || !currentUser.email) {
        throw new Error("User authentication required");
      }
      
      await axios.delete(
        `${API_BASE_URL}/api/dailywork/delete/${rowToDelete}`,
        { withCredentials: true }
      );
      
      const updatedReports = reports.filter(row => row.id !== rowToDelete);
      setReports(updatedReports);
      setFilteredReports(filteredReports.filter(row => row.id !== rowToDelete));
      
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
    csvContent += "sr.no,Company Name,Project Name,Date,Supervisor Name,Manager Name,Prepared By,No. of Employee,Nature of Work,Progress,Hour of Work,Charges\n";
    
    filteredReports.forEach((row, index) => {
      csvContent += `${index + 1},`;
      csvContent += `"${row.companyName || ""}",`;
      csvContent += `"${row.projectName || ""}",`;
      csvContent += `${row.date ? new Date(row.date).toLocaleDateString() : ""},`;
      csvContent += `"${row.supervisorName || ""}",`;
      csvContent += `"${row.managerName || ""}",`;
      csvContent += `"${row.prepaidBy || ""}",`;
      csvContent += `${row.employees || ""},`;
      csvContent += `"${row.workType || ""}",`;
      csvContent += `${row.progress || ""},`;
      csvContent += `${row.hours || ""},`;
      csvContent += `${row.charges || "0"}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily-worker-report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredReports.length} worker report records to CSV`,
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
        <Text mt={3}>Loading worker report data...</Text>
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
            placeholder="Search by company, project, supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW="200px" 
          value={filterProgress} 
          onChange={(e) => setFilterProgress(e.target.value)}
        >
          <option value="All">All Progress</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Not Started">Not Started</option>
        </Select>
        
        <Button 
          leftIcon={<DownloadIcon />} 
          colorScheme="blue" 
          onClick={exportToCSV}
          isDisabled={filteredReports.length === 0}
        >
          Export CSV
        </Button>

        {isAdmin && (
          <Button 
            leftIcon={<UserPlusIcon style={{ width: "16px", height: "16px" }} />} 
            colorScheme="green"
            onClick={handleAddRow}
          >
            Add Report
          </Button>
        )}
      </HStack>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredReports.length} of {reports.length} reports
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="gray.50">
            <Tr>
              {tableHeaders.map(header => (
                <Th key={header.id}>{header.label}</Th>
              ))}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {getPaginatedData().length > 0 ? (
              getPaginatedData().map((row) => (
                <Tr key={row.id} _hover={{ bg: "gray.50" }}>
                  {tableHeaders.map(header => {
                    const value = header.altKey ? 
                      (row[header.id] || row[header.altKey] || "") : 
                      (row[header.id] || "");
                    
                    if (header.id === "progress") {
                      return (
                        <Td key={header.id}>
                          {getProgressBadge(value)}
                        </Td>
                      );
                    }
                    if (header.id === "date") {
                      return (
                        <Td key={header.id}>
                          {value ? new Date(value).toLocaleDateString() : "-"}
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
                <Td colSpan={tableHeaders.length + 1} textAlign="center" py={4}>
                  No report data matching current filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination Controls */}
      <Flex justifyContent="space-between" mt={4} alignItems="center">
        <Text fontSize="sm">
          Showing {Math.min(rowsPerPage, filteredReports.length - (currentPage - 1) * rowsPerPage)} of {filteredReports.length} results
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
            Page {currentPage} of {Math.max(1, Math.ceil(filteredReports.length / rowsPerPage))}
          </Text>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage >= Math.ceil(filteredReports.length / rowsPerPage)}
          >
            Next
          </Button>
          <Button
            size="sm"
            onClick={() => handlePageChange(Math.ceil(filteredReports.length / rowsPerPage))}
            isDisabled={currentPage >= Math.ceil(filteredReports.length / rowsPerPage)}
          >
            Last
          </Button>
        </HStack>
      </Flex>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedRowId ? "Edit Report" : "Add New Report"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Company Name</FormLabel>
              <Input
                value={newRow.companyName || ""}
                onChange={(e) => setNewRow({...newRow, companyName: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input
                value={newRow.projectName || ""}
                onChange={(e) => setNewRow({...newRow, projectName: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={newRow.date || ""}
                onChange={(e) => setNewRow({...newRow, date: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Supervisor Name</FormLabel>
              <Input
                value={newRow.supervisorName || ""}
                onChange={(e) => setNewRow({...newRow, supervisorName: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Manager Name</FormLabel>
              <Input
                value={newRow.managerName || ""}
                onChange={(e) => setNewRow({...newRow, managerName: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Prepared By</FormLabel>
              <Input
                value={newRow.prepaidBy || ""}
                onChange={(e) => setNewRow({...newRow, prepaidBy: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>No. of Employee</FormLabel>
              <Input
                type="number"
                value={newRow.employees || ""}
                onChange={(e) => setNewRow({...newRow, employees: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Nature of Work</FormLabel>
              <Input
                value={newRow.workType || ""}
                onChange={(e) => setNewRow({...newRow, workType: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Progress</FormLabel>
              <Select
                value={newRow.progress || "In Progress"}
                onChange={(e) => setNewRow({...newRow, progress: e.target.value})}
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Not Started">Not Started</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Hour of Work</FormLabel>
              <Input
                type="number"
                value={newRow.hours || ""}
                onChange={(e) => setNewRow({...newRow, hours: e.target.value})}
              />
            </FormControl>

            <FormControl mb={4} display="none">
              <FormLabel>Charges</FormLabel>
              <Input
                value={newRow.charges || "0"}
                onChange={(e) => setNewRow({...newRow, charges: e.target.value})}
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
              Delete Report
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this report record? This action cannot be undone.
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

export default DailyWorkerReportTable;