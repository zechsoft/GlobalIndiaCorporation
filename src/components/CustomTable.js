// src/components/CustomTable.jsx
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Flex,
  FormControl,
  Input,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useToast,
  Select,
  InputGroup,
  InputLeftElement,
  Badge,
  Text,
  Spinner
} from "@chakra-ui/react";
import { AddIcon, SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import axios from "axios";

const CustomTable = ({ table }) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // Initialize form data with column names
    const initialFormData = {};
    if (table && table.columns) {
      table.columns.forEach(column => {
        initialFormData[column.name] = "";
      });
    }
    setFormData(initialFormData);
    fetchTableData();
  }, [table]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(tableData);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = tableData.filter(row => {
        return Object.keys(row).some(key => {
          if (key === "_id" || key === "__v") return false;
          return String(row[key]).toLowerCase().includes(term);
        });
      });
      setFilteredData(filtered);
    }
  }, [searchTerm, tableData]);

  const fetchTableData = async () => {
    if (!table || !table._id) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/custom-tables/${table._id}/data`);
      setTableData(response.data.data || []);
      setFilteredData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching table data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch table data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    const missingFields = [];
    table.columns.forEach(column => {
      if (column.required && !formData[column.name]) {
        missingFields.push(column.name);
      }
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill out required fields: ${missingFields.join(", ")}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/custom-tables/${table._id}/data`, {
        data: formData
      });
      
      // Clear form and close modal
      const initialFormData = {};
      table.columns.forEach(column => {
        initialFormData[column.name] = "";
      });
      setFormData(initialFormData);
      onClose();
      
      // Refresh table data
      fetchTableData();
      
      toast({
        title: "Success",
        description: "Data saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const exportToCSV = () => {
    // Create CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += table.columns.map(col => `"${col.name}"`).join(",") + "\n";
    
    // Add data rows
    filteredData.forEach(row => {
      const rowData = table.columns.map(col => {
        const value = row[col.name] || "";
        return `"${value}"`;
      }).join(",");
      csvContent += rowData + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${table.name}-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredData.length} records to CSV`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const renderInputField = (column) => {
    switch (column.type) {
      case 'number':
        return (
          <Input
            type="number"
            name={column.name}
            value={formData[column.name] || ""}
            onChange={handleInputChange}
            placeholder={`Enter ${column.name}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            name={column.name}
            value={formData[column.name] || ""}
            onChange={handleInputChange}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            name={column.name}
            value={formData[column.name] || ""}
            onChange={handleInputChange}
            placeholder={`Enter ${column.name}`}
          />
        );
      case 'select':
        return (
          <Select
            name={column.name}
            value={formData[column.name] || ""}
            onChange={handleInputChange}
            placeholder={`Select ${column.name}`}
          >
            {(column.options || []).map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </Select>
        );
      default: // text
        return (
          <Input
            type="text"
            name={column.name}
            value={formData[column.name] || ""}
            onChange={handleInputChange}
            placeholder={`Enter ${column.name}`}
          />
        );
    }
  };

  if (!table) {
    return <Text>No table selected</Text>;
  }

  return (
    <Box>
      {/* Filter and action controls */}
      <Flex justify="space-between" mb={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Flex gap={2}>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="green" 
            onClick={onOpen}
          >
            Add Record
          </Button>
          
          <Button 
            leftIcon={<DownloadIcon />} 
            colorScheme="blue" 
            onClick={exportToCSV}
            isDisabled={filteredData.length === 0}
          >
            Export CSV
          </Button>
        </Flex>
      </Flex>
      
      {/* Results count */}
      <Text mb={3}>
        Showing {filteredData.length} of {tableData.length} records
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        {isLoading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        ) : (
          <Table variant="simple" size="md">
            <Thead bg="gray.50">
              <Tr>
                <Th>#</Th>
                {table.columns.map((column, index) => (
                  <Th key={index}>{column.name}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <Tr key={rowIndex} _hover={{ bg: "gray.50" }}>
                    <Td>{rowIndex + 1}</Td>
                    {table.columns.map((column, colIndex) => (
                      <Td key={colIndex}>
                        {row[column.name] || "-"}
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={table.columns.length + 1} textAlign="center" py={4}>
                    No records found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Add Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Record to {table.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {table.columns.map((column, index) => (
              <FormControl key={index} mb={4} isRequired={column.required}>
                <FormLabel>
                  {column.name}
                  {column.required && (
                    <Badge ml={1} colorScheme="red">Required</Badge>
                  )}
                </FormLabel>
                {renderInputField(column)}
              </FormControl>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomTable;