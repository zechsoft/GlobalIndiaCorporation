import {
  Box,
  Button,
  Flex,
  Grid,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import IconBox from "components/Icons/IconBox";
import { React, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import axios from "axios";

// Custom icons
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
// Variables
import { dailyWorkData, socialTraffic } from "variables/general";

export default function Dashboard() {
  // Chakra Color Mode
  const iconBlue = useColorModeValue("blue.500", "blue.500");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const tableRowColor = useColorModeValue("#F7FAFC", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textTableColor = useColorModeValue("gray.500", "white");

  const { colorMode } = useColorMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const history = useHistory();
  const location = useLocation();
  
  // Backend API URL
    const API_URL = "https://globalindiabackendnew.onrender.com/api";

  
  // State for dashboard table data
  const [dashboardTableData, setDashboardTableData] = useState({
    "Material Inquiry": [],
    "Supplier Information": [],
    "Customer Delivery": [],
    "Customer Order": [],
    "Material Replenishment": []
  });

  // Edit modal state
  const [editModal, setEditModal] = useState({
    isOpen: false,
    data: null,
    tableName: ""
  });

  const [currentTableData, setCurrentTableData] = useState([]);
  const [allDailyWorkData, setAllDailyWorkData] = useState([]);

  // Table navigation
  const [currentTable, setCurrentTable] = useState("Material Inquiry");
  const tableNames = [
    "Supplier Information",
    "Material Inquiry",
    "Customer Delivery",
    "Customer Order",
    "Material Replenishment"
  ];
  
  const [userType, setUserType] = useState('');
  const [dailyData, setDailyData] = useState([]);

  // Function to filter daily work data by date
  const filterDailyWorkByDate = (data, date) => {
    if (!data || !Array.isArray(data)) return [];
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return data.filter(item => {
      if (!item.Date) return false;
      const itemDate = new Date(item.Date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === targetDate.getTime();
    }).slice(0, 5);
  };

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchAllData = async() => {
      try {
        // Fetch daily work data
        const dailyWorkResponse = await axios.get(`${API_URL}/dailywork/get-all`);
        setAllDailyWorkData(dailyWorkResponse.data.data);
        
        // Filter daily work data by current date
        const filteredDailyData = filterDailyWorkByDate(dailyWorkResponse.data.data, currentDate);
        setDailyData(filteredDailyData);
        
        // Fetch dashboard table data from the new endpoint
        const dashboardResponse = await axios.get(`${API_URL}/dashboard-tables/get-all`);
        if (dashboardResponse.data.success) {
          setDashboardTableData(dashboardResponse.data.data);
          // Set initial current table data
          setCurrentTableData(dashboardResponse.data.data["Material Inquiry"] || []);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Extract the base path (admin or client) from the current location
    var userData = JSON.parse(localStorage.getItem("user"));
    
    if(userData === null || userData === undefined) {
      userData = JSON.parse(sessionStorage.getItem("user"));
    }

    if(userData && userData.role) {
      setUserType(userData.role);
    }
  }, [location]);

  // Navigation function
  const navigateTo = (page) => {
    console.log(userType,"",page,"in dash.js");
    history.push(`/${userType}/${page}`);
  };

  const goToPreviousDate = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1); 
      return newDate;
    });
  };

  const goToNextDate = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handlePrevTable = () => {
    const currentIndex = tableNames.indexOf(currentTable);
    if (currentIndex > 0) {
      const newTable = tableNames[currentIndex - 1];
      setCurrentTable(newTable);
      setCurrentTableData(dashboardTableData[newTable] || []);
    }
  };

  const handleNextTable = () => {
    const currentIndex = tableNames.indexOf(currentTable);
    if (currentIndex < tableNames.length - 1) {
      const newTable = tableNames[currentIndex + 1];
      setCurrentTable(newTable);
      setCurrentTableData(dashboardTableData[newTable] || []);
    }
  };

  // Edit functionality
  const handleEdit = (item, tableName) => {
    setEditModal({
      isOpen: true,
      data: item,
      tableName: tableName
    });
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/dashboard-tables/update/${updatedData._id}`, {
        ...updatedData,
        tableName: editModal.tableName
      });
      
      if (response.data.success) {
        // Update local state
        const updatedDashboardData = { ...dashboardTableData };
        const tableData = updatedDashboardData[editModal.tableName];
        const itemIndex = tableData.findIndex(item => item._id === updatedData._id);
        if (itemIndex !== -1) {
          tableData[itemIndex] = response.data.data;
          setDashboardTableData(updatedDashboardData);
          setCurrentTableData(updatedDashboardData[currentTable] || []);
        }
        setEditModal({ isOpen: false, data: null, tableName: "" });
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const isToday = currentDate.toLocaleDateString() === new Date().toLocaleDateString();
  
  const formattedDate = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Map for routing from display name to route path
  const routeMap = {
    "Supplier Information": "supplier-info",
    "Material Inquiry": "material-inquiry",
    "Customer Delivery": "customer-delivery-notice",
    "Customer Order": "customer-order",
    "Material Replenishment": "material-replenishment",
    "Daily Work Report": "daily-work-report"
  };

  // Function to handle card clicks
  const handleCardClick = (cardName) => {
    const route = routeMap[cardName];
    if (route) {
      navigateTo(route);
    }
  };

  // EditModal component
  const EditModal = () => {
    const [formData, setFormData] = useState(editModal.data || {});

    useEffect(() => {
      setFormData(editModal.data || {});
    }, [editModal.data]);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <Modal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, data: null, tableName: "" })}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit {editModal.tableName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Project</FormLabel>
                <Input
                  value={formData.project || ""}
                  onChange={(e) => handleInputChange("project", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status || ""}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ""}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditModal({ isOpen: false, data: null, tableName: "" })}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={() => handleSaveEdit(formData)}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ base: 1, md: 3, lg: 3 }} spacing="24px" mb="20px">
        {/* Card 1: Supplier Information */}
        <Card
          minH="125px"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={() => handleCardClick("Supplier Information")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  new entry
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize={18}
                    color={textColor}
                    fontWeight="bold"
                    position="relative"
                    _hover={{
                      _after: {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: "-2px",
                        width: "100%",
                        height: "2px",
                        bg: "blue.500",
                        transition: "width 0.3s ease-in-out",
                      },
                    }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: "-2px",
                      width: "0%",
                      height: "2px",
                      bg: "blue.500",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    Supplier Information
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox borderRadius="50%" as="box" h={"45px"} w={"45px"} bg={iconBlue}>
                <WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            <Text color="gray.400" fontSize="sm">
              <Box _hover={{ cursor: "pointer" }}>
                Tap here to view
              </Box>
            </Text>
          </Flex>
        </Card>

        {/* Card 2: Material Inquiry */}
        <Card
          minH="125px"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={() => handleCardClick("Material Inquiry")}
        >
          <Flex direction="column">
            <Flex flexDirection="row" align="center" justify="center" w="100%" mb="25px">
              <Stat me="auto">
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  new entry
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    position="relative"
                    _hover={{
                      _after: {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: "-2px",
                        width: "100%",
                        height: "2px",
                        bg: "blue.500",
                        transition: "width 0.3s ease-in-out",
                      },
                    }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: "-2px",
                      width: "0%",
                      height: "2px",
                      bg: "blue.500",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    Material Inquiry
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox borderRadius="50%" as="box" h={"45px"} w={"45px"} bg={iconBlue}>
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            <Text color="gray.400" fontSize="sm">
              <Box _hover={{ cursor: "pointer" }}>
                Tap here to view
              </Box>
            </Text>
          </Flex>
        </Card>

        {/* Card 3: Customer Delivery */}
        <Card
          minH="125px"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={() => handleCardClick("Customer Delivery")}
        >
          <Flex direction="column">
            <Flex flexDirection="row" align="center" justify="center" w="100%" mb="25px">
              <Stat me="auto">
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  new entry
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    position="relative"
                    _hover={{
                      _after: {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: "-2px",
                        width: "100%",
                        height: "2px",
                        bg: "blue.500",
                        transition: "width 0.3s ease-in-out",
                      },
                    }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: "-2px",
                      width: "0%",
                      height: "2px",
                      bg: "blue.500",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    Customer Delivery
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox borderRadius="50%" as="box" h={"45px"} w={"45px"} bg={iconBlue}>
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            <Text color="gray.400" fontSize="sm">
              <Box _hover={{ cursor: "pointer" }}>
                Tap here to view
              </Box>
            </Text>
          </Flex>
        </Card>

        {/* Card 4: Customer Order */}
        <Card
          minH="125px"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={() => handleCardClick("Customer Order")}
        >
          <Flex direction="column">
            <Flex flexDirection="row" align="center" justify="center" w="100%" mb="25px">
              <Stat me="auto">
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  new entry
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    position="relative"
                    _hover={{
                      _after: {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: "-2px",
                        width: "100%",
                        height: "2px",
                        bg: "blue.500",
                        transition: "width 0.3s ease-in-out",
                      },
                    }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: "-2px",
                      width: "0%",
                      height: "2px",
                      bg: "blue.500",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    Customer Order
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox borderRadius="50%" as="box" h={"45px"} w={"45px"} bg={iconBlue}>
                <CartIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            <Text color="gray.400" fontSize="sm"> 
              <Box _hover={{ cursor: "pointer" }}>
                Tap here to view
              </Box>
            </Text>
          </Flex>
        </Card>

        {/* Card 5: Material Replenishment */}
        <Card
          minH="125px"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={() => handleCardClick("Material Replenishment")}
        >
          <Flex direction="column">
            <Flex flexDirection="row" align="center" justify="center" w="100%" mb="25px">
              <Stat me="auto">
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  new entry
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize={18.5}
                    color={textColor}
                    fontWeight="bold"
                    position="relative"
                    _hover={{
                      _after: {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: "-2px",
                        width: "100%",
                        height: "2px",
                        bg: "blue.500",
                        transition: "width 0.3s ease-in-out",
                      },
                    }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: "-2px",
                      width: "0%",
                      height: "2px",
                      bg: "blue.500",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    Material Replenishment
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox borderRadius="50%" as="box" h={"45px"} w={"45px"} bg={iconBlue}>
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            <Text color="gray.400" fontSize="sm">
              <Box _hover={{ cursor: "pointer" }}>
                Tap here to view
              </Box>
            </Text>
          </Flex>
        </Card>

        {/* Card 6: Daily Work Report */}
        <Card
          minH="125px"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: "scale(1.05)", cursor: "pointer" }}
          onClick={() => handleCardClick("Daily Work Report")}
        >
          <Flex direction="column">
            <Flex flexDirection="row" align="center" justify="center" w="100%" mb="25px">
              <Stat me="auto">
                <StatLabel fontSize="xs" color="gray.400" fontWeight="bold" textTransform="uppercase">
                  new entry
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="18"
                    color={textColor}
                    fontWeight="bold"
                    position="relative"
                    _hover={{
                      _after: {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        bottom: "-2px",
                        width: "100%",
                        height: "2px",
                        bg: "blue.500",
                        transition: "width 0.3s ease-in-out",
                      },
                    }}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: "-2px",
                      width: "0%",
                      height: "2px",
                      bg: "blue.500",
                      transition: "width 0.3s ease-in-out",
                    }}
                  >
                    Daily Work Report
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox borderRadius="50%" as="box" h={"45px"} w={"45px"} bg={iconBlue}>
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            <Text color="gray.400" fontSize="sm">
              <Box _hover={{ cursor: "pointer" }}>
                Tap here to view
              </Box>
            </Text>
          </Flex>
        </Card>
      </SimpleGrid>

      {/* Tables section */}
      <Grid templateColumns={{ sm: "1fr", lg: "2fr 1fr" }} templateRows={{ lg: "repeat(2, auto)" }} gap="20px">
        <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
          <Flex direction="column">
            <Flex align="center" justify="space-between" p="22px">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Daily Work
              </Text>
              <Flex align="center">
                <Button variant="link" onClick={goToPreviousDate} fontSize="lg" color="gray.400" mr="10px">
                  &lt;
                </Button>
                <Text color="gray.400" fontSize="sm">{formattedDate}</Text>
                <Button
                  variant="link"
                  onClick={goToNextDate}
                  fontSize="lg"
                  color="gray.400"
                  ml="10px"
                  style={{ display: isToday ? 'none' : 'block' }}
                >
                  &gt;
                </Button>
              </Flex>
              <Button variant="primary" maxH="30px"  onClick={() => handleCardClick("Daily Work Report")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                SEE ALL
              </Button>
            </Flex>
            <Box overflow={{ sm: "scroll", lg: "hidden" }}>
              <Table>
                <Thead>
                  <Tr bg={tableRowColor}>
                    <Th
                      color="gray.400"
                      borderColor={borderColor}
                      position="relative"
                      _hover={{ color: "blue.500" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2px",
                          backgroundColor: "blue",
                        }}
                      />
                      Nature of Work
                    </Th>
                    <Th
                      color="gray.400"
                      borderColor={borderColor}
                      position="relative"
                      _hover={{ color: "blue.500" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2px",
                          backgroundColor: "blue",
                        }}
                      />
                      Progress
                    </Th>
                    <Th
                      color="gray.400"
                      borderColor={borderColor}
                      position="relative"
                      _hover={{ color: "blue.500" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2px",
                          backgroundColor: "blue",
                        }}
                      />
                      Hour of Work
                    </Th>
                    <Th
                      color="gray.400"
                      borderColor={borderColor}
                      position="relative"
                      _hover={{ color: "blue.500" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2px",
                          backgroundColor: "blue",
                        }}
                      />
                      Supervisor Name
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dailyData.map((el, index, arr) => (
                    <Tr
                      key={index}
                      _hover={{ bg: "blue.50" }}
                      transition="background-color 0.3s ease"
                    >
                      <Td color={textTableColor} fontSize="sm" fontWeight="bold" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {el.NatureofWork}
                      </Td>
                      <Td color={textTableColor} fontSize="sm" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {el.Progress}
                      </Td>
                      <Td color={textTableColor} fontSize="sm" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {el.HourofWork}
                      </Td>
                      <Td color={textTableColor} fontSize="sm" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {el.SupervisorName}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Flex>
        </Card>
        
        <Card p="0px" maxW={{ sm: "320px", md: "100%" }}>
          <Flex direction="column">
            <Flex align="center" justify="space-between" p="22px">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                {currentTable}
              </Text>
              <Button 
                variant="link" 
                fontSize="sm" 
                color="gray.400" 
                ml="auto" 
                mr="30px" 
                onClick={handlePrevTable}
              >
                Previous
              </Button>
              <Button 
                variant="link" 
                fontSize="sm" 
                color="gray.400" 
                onClick={handleNextTable}
              >
                Next
              </Button>
            </Flex>
          </Flex>

          <Box overflow={{ sm: "scroll", lg: "hidden" }}>
            <Table>
              <Thead>
                <Tr bg={tableRowColor}>
                  <Th
                    color="gray.400"
                    borderColor={borderColor}
                    position="relative"
                    _hover={{ color: "blue.500" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: "2px",
                        backgroundColor: "blue",
                      }}
                    />
                    Project
                  </Th>
                  <Th
                    color="gray.400"
                    borderColor={borderColor}
                    position="relative"
                    _hover={{ color: "blue.500" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: "2px",
                        backgroundColor: "blue",
                      }}
                    />
                    Status
                  </Th>
                  <Th
                    color="gray.400"
                    borderColor={borderColor}
                    position="relative"
                    _hover={{ color: "blue.500" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: "2px",
                        backgroundColor: "blue",
                      }}
                    />
                    Date
                  </Th>
                  <Th color="gray.400" borderColor={borderColor}></Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentTableData.length > 0 ? (
                  currentTableData.map((item, index, arr) => (
                    <Tr
                      key={index}
                      _hover={{ bg: "blue.50" }}
                      transition="background-color 0.3s ease"
                    >
                      <Td color={textTableColor} fontSize="sm" fontWeight="bold" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {item.project || "N/A"}
                      </Td>
                      <Td color={textTableColor} fontSize="sm" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {item.status || "Pending"}
                      </Td>
                      <Td color={textTableColor} fontSize="sm" borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        {new Date(item.date).toLocaleDateString()}
                      </Td>
                      <Td borderColor={borderColor} border={index === arr.length - 1 ? "none" : null}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(item, currentTable)}
                        >
                          ✏️
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4} textAlign="center">No data available</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </Grid>

      {/* Edit Modal */}
      <EditModal />
    </Flex>
  );
}