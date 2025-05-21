import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Link,
  Checkbox,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  CloseButton,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

export default function SignIn() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const blueShade = useColorModeValue("#0072ff", "#0072ff");
  const companyBlue = "#003366"; // Company primary color

  // State for form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Scroll animation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Refs for animated sections
  const aboutSectionRef = useRef(null);
  const missionSectionRef = useRef(null);
  const projectsSectionRef = useRef(null); 

  // Toast for notifications
  const toast = useToast();

  // Initialize useHistory
  const history = useHistory();

  // Scroll event handler - enhanced with scroll position tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (window.scrollY > window.innerHeight / 3 && !isOpened) {
        setIsOpened(true);
        setShowScrollDown(false);
        openModal();
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpened]);

  // Modal controls
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "initial";
  };

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 27) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Function to handle sign in
  const handleSignIn = async () => {
    // Simple validation
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Make API call to backend

      const data = {
        "email" : email,
        "password" : password
      }
      
      const response  = await axios.post("https://globalindiabackendnew.onrender.com/api/login",data,{
        withCredentials : true
      })


      // Extract user role from the response
      const userRole = response.data.role;

      // Success - store user info in localStorage or sessionStorage
      const userData = {
        email: response.data.displayMail,
        role: response.data.role, // Use the role from server response
        isAuthenticated: response.data.isAuthenticated,
        mobile : response.data.mobile,
        name : response.data.displayName,
        location : response.data.location,
        bio : response.data.bio
      };


      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      // Redirect based on role from server response
      if (userRole === "admin") {
        history.push("/admin/dashboard");
      } else {
        history.push("/client/dashboard");
      }

      toast({
        title: "Login Successful",
        description: `Welcome to Global India Corporation!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err.response.data.error || "Invalid email or password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  // Animation variants for scroll animations
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideInLeftVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const slideInRightVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Calculate animation trigger based on scroll position
  const inViewThreshold = 100;
  const isAboutInView = scrollY > (aboutSectionRef.current?.offsetTop - window.innerHeight + inViewThreshold || 0);
  const isMissionInView = scrollY > (missionSectionRef.current?.offsetTop - window.innerHeight + inViewThreshold || 0);
  const isProjectsInView = scrollY > (projectsSectionRef.current?.offsetTop - window.innerHeight + inViewThreshold || 0);

  return (
    <Flex direction="column" align="center" minH="350vh">
      {/* Hero Section with Background */}
      <Box 
        w="full" 
        h="100vh" 
        position="relative"
        bgImage="url(https://images.unsplash.com/photo-1538137524007-21e48fa42f3f)"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        {/* Overlay with company logo and name */}
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.6)"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          color="white"
        >
          <MotionHeading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl" }}
            fontWeight="bold"
            textAlign="center"
            mb="6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            GLOBAL INDIA CORPORATION
          </MotionHeading>
          
          <MotionText
            fontSize={{ base: "xl", md: "2xl" }}
            textAlign="center"
            maxW="800px"
            mb="10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            Building India's Future Through Innovation, Infrastructure & Excellence
          </MotionText>
          
          <MotionBox
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Button
              size="lg"
              bg="linear-gradient(to right, #00c6ff, #0072ff)"
              color="white"
              px="10"
              fontSize="lg"
              _hover={{ bg: "linear-gradient(to right, #00a1cc, #005bbb)" }}
              onClick={openModal}
            >
              LOGIN TO PORTAL
            </Button>
          </MotionBox>
        </Flex>
      </Box>
      
      {/* Scroll down indicator */}
      {showScrollDown && (
        <MotionFlex
          position="fixed"
          bottom="10%"
          left="50%"
          direction="column"
          align="center"
          textAlign="center"
          color="white"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="700"
          transform="translate(-50%, 0)"
          zIndex="2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: [0, 10, 0],
            transition: {
              y: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              },
              opacity: { duration: 0.5 }
            }
          }}
        >
          EXPLORE MORE
          <Box as="svg" mt="8px" w="36px" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M16 3C8.832031 3 3 8.832031 3 16s5.832031 13 13 13 13-5.832031 13-13S23.167969 3 16 3zm0 2c6.085938 0 11 4.914063 11 11 0 6.085938-4.914062 11-11 11-6.085937 0-11-4.914062-11-11C5 9.914063 9.914063 5 16 5zm-1 4v10.28125l-4-4-1.40625 1.4375L16 23.125l6.40625-6.40625L21 15.28125l-4 4V9z"/>
          </Box>
        </MotionFlex>
      )}

      {/* About Section */}
      <Box 
        ref={aboutSectionRef} 
        w="full" 
        minH="80vh" 
        bg="#f8f9fa" 
        py="20"
      >
        <Flex 
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="center"
          maxW="1200px"
          mx="auto"
          px="6"
          gap="10"
        >
          <MotionBox
            w={{ base: "100%", lg: "50%" }}
            initial="hidden"
            animate={isAboutInView ? "visible" : "hidden"}
            variants={slideInLeftVariants}
          >
            <Heading 
              as="h2" 
              size="xl" 
              color={companyBlue}
              mb="6"
            >
              About Global India Corporation
            </Heading>
            <Text fontSize="lg" mb="4">
              Established in 1996, Global India Corporation (GIC) has evolved into one of India's largest engineering and construction conglomerates, similar to industry leaders like L&T. With expertise spanning across infrastructure, power, defense, and technology, GIC has been instrumental in shaping India's development landscape.
            </Text>
            <Text fontSize="lg">
              We leverage cutting-edge technologies and world-class engineering practices to deliver exceptional value to our stakeholders. Our commitment to quality, safety, and sustainability has earned us recognition as a trusted partner for complex projects that drive national growth.
            </Text>
          </MotionBox>
          
          <MotionBox
            w={{ base: "100%", lg: "50%" }}
            h={{ base: "300px", md: "400px" }}
            bgImage="url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)"
            bgSize="cover"
            bgPosition="center"
            borderRadius="md"
            boxShadow="xl"
            initial="hidden"
            animate={isAboutInView ? "visible" : "hidden"}
            variants={slideInRightVariants}
          />
        </Flex>
      </Box>

      {/* Mission and Values Section */}
      <Box 
        ref={missionSectionRef}
        w="full" 
        minH="80vh" 
        bg="#e9ecef" 
        py="20"
      >
        <VStack
          spacing="16"
          maxW="1200px"
          mx="auto"
          px="6"
        >
          <MotionHeading
            as="h2"
            size="xl"
            color={companyBlue}
            textAlign="center"
            initial="hidden"
            animate={isMissionInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
          >
            Our Mission & Values
          </MotionHeading>
          
          <Flex 
            direction={{ base: "column", md: "row" }}
            justify="center"
            w="full"
            gap="8"
          >
            <MotionBox
              bg="white"
              p="8"
              borderRadius="lg"
              boxShadow="md"
              w={{ base: "100%", md: "33%" }}
              initial="hidden"
              animate={isMissionInView ? "visible" : "hidden"}
              variants={scaleInVariants}
              transition={{ delay: 0.1 }}
            >
              <Heading as="h3" size="md" color={companyBlue} mb="4">Excellence</Heading>
              <Text>We strive for excellence in everything we do, from engineering precision to project execution. Our meticulous attention to detail and commitment to quality sets new industry benchmarks.</Text>
            </MotionBox>
            
            <MotionBox
              bg="white"
              p="8"
              borderRadius="lg"
              boxShadow="md"
              w={{ base: "100%", md: "33%" }}
              initial="hidden"
              animate={isMissionInView ? "visible" : "hidden"}
              variants={scaleInVariants}
              transition={{ delay: 0.3 }}
            >
              <Heading as="h3" size="md" color={companyBlue} mb="4">Innovation</Heading>
              <Text>We embrace innovation to solve complex challenges and drive efficiency. Our R&D centers constantly develop new methodologies and technologies to address India's growing infrastructure needs.</Text>
            </MotionBox>
            
            <MotionBox
              bg="white"
              p="8"
              borderRadius="lg"
              boxShadow="md"
              w={{ base: "100%", md: "33%" }}
              initial="hidden"
              animate={isMissionInView ? "visible" : "hidden"}
              variants={scaleInVariants}
              transition={{ delay: 0.5 }}
            >
              <Heading as="h3" size="md" color={companyBlue} mb="4">Sustainability</Heading>
              <Text>We are committed to sustainable development that balances environmental responsibility with economic growth. Our green initiatives and eco-friendly designs ensure a positive impact on communities.</Text>
            </MotionBox>
          </Flex>
        </VStack>
      </Box>
      
      {/* Projects Section */}
      <Box 
        ref={projectsSectionRef}
        w="full" 
        minH="80vh" 
        bg="#f8f9fa" 
        py="20"
      >
        <VStack
          spacing="12"
          maxW="1200px"
          mx="auto"
          px="6"
        >
          <MotionHeading
            as="h2"
            size="xl"
            color={companyBlue}
            textAlign="center"
            initial="hidden"
            animate={isProjectsInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
          >
            Landmark Projects
          </MotionHeading>
          
          <Flex 
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align="stretch"
            w="full"
            gap="8"
            wrap="wrap"
          >
            <MotionBox
              w={{ base: "100%", lg: "48%" }}
              mb="8"
              initial="hidden"
              animate={isProjectsInView ? "visible" : "hidden"}
              variants={slideInLeftVariants}
            >
              <Box
                h="300px"
                bgImage="url(https://images.unsplash.com/photo-1545711915-5c994c59a7a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)"
                bgSize="cover"
                bgPosition="center"
                borderRadius="md"
                mb="4"
              />
              <Heading as="h3" size="md" color={companyBlue} mb="2">Mumbai-Ahmedabad High-Speed Rail</Heading>
              <Text>India's first bullet train project, spanning 508km and connecting two major economic hubs with cutting-edge Japanese Shinkansen technology.</Text>
            </MotionBox>
            
            <MotionBox
              w={{ base: "100%", lg: "48%" }}
              mb="8"
              initial="hidden"
              animate={isProjectsInView ? "visible" : "hidden"}
              variants={slideInRightVariants}
            >
              <Box
                h="300px"
                bgImage="url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)"
                bgSize="cover"
                bgPosition="center"
                borderRadius="md"
                mb="4"
              />
              <Heading as="h3" size="md" color={companyBlue} mb="2">Green Energy Complex, Gujarat</Heading>
              <Text>A 5GW integrated renewable energy park combining solar, wind, and storage systems, making it one of Asia's largest clean energy installations.</Text>
            </MotionBox>
            
            <MotionBox
              w={{ base: "100%", lg: "48%" }}
              mb={{ base: "8", lg: "0" }}
              initial="hidden"
              animate={isProjectsInView ? "visible" : "hidden"}
              variants={slideInLeftVariants}
              transition={{ delay: 0.2 }}
            >
              <Box
                h="300px"
                bgImage="url(https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)"
                bgSize="cover"
                bgPosition="center"
                borderRadius="md"
                mb="4"
              />
              <Heading as="h3" size="md" color={companyBlue} mb="2">Bangalore Smart City Initiative</Heading>
              <Text>A comprehensive urban transformation project incorporating IoT, AI-driven traffic management, and sustainable urban planning solutions.</Text>
            </MotionBox>
            
            <MotionBox
              w={{ base: "100%", lg: "48%" }}
              initial="hidden"
              animate={isProjectsInView ? "visible" : "hidden"}
              variants={slideInRightVariants}
              transition={{ delay: 0.2 }}
            >
              <Box
                h="300px"
                bgImage="url(https://images.unsplash.com/photo-1513828583688-c52646db42da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)"
                bgSize="cover"
                bgPosition="center"
                borderRadius="md"
                mb="4"
              />
              <Heading as="h3" size="md" color={companyBlue} mb="2">Eastern Dedicated Freight Corridor</Heading>
              <Text>A 1,840km freight-only railway system modernizing India's logistics infrastructure and connecting major industrial centers across six states.</Text>
            </MotionBox>
          </Flex>
        </VStack>
      </Box>

      {/* Modal Button */}
      <Button
        position="fixed"
        left="0"
        bottom="0"
        w="full"
        h="60px"
        bg="rgba(0, 51, 102, 0.85)"
        color="white"
        fontFamily="Nunito, sans-serif"
        fontSize="18px"
        borderRadius="0"
        _hover={{ bg: "rgba(0, 51, 102, 0.95)" }}
        onClick={openModal}
        display={isModalOpen ? "none" : "flex"}
        leftIcon={<Box as="span" w="4px" h="4px" mr="1" animation="pulse 1.5s infinite" />}
        sx={{
          "@keyframes pulse": {
            "0%": { opacity: 0.6, transform: "scale(1)" },
            "50%": { opacity: 1, transform: "scale(1.2)" },
            "100%": { opacity: 0.6, transform: "scale(1)" }
          }
        }}
      >
        SECURE EMPLOYEE PORTAL LOGIN
      </Button>

      {/* Login Modal using Chakra UI */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="5xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="rgba(0, 0, 0, 0.85)" />
        <ModalContent borderRadius="10px" overflow="hidden" maxW="1300px">
          <CloseButton 
            position="absolute" 
            right="10px" 
            top="10px" 
            zIndex="10" 
            onClick={closeModal}
            color="white"
          />
          <ModalBody p="0">
            <Flex w="full" justifyContent="space-between" alignItems="stretch">
              {/* Left Column (Login Form) */}
              <Flex
                w={{ base: "100%", md: "50%" }}
                direction="column"
                bg={bgForm}
                p="60px"
                borderTopLeftRadius="20px"
                borderBottomLeftRadius="20px"
                justifyContent="center"
              >
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heading as="h2" fontSize="4xl" color={companyBlue} fontWeight="bold" textAlign="center" mb="4">
                    Global India Corporation
                  </Heading>
                  <Text mb="9" textAlign="center" color={textColor}>
                    Enter your credentials to access the employee portal
                  </Text>
                </MotionBox>

                {/* Google Sign-In Button */}
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Button
                    leftIcon={<FcGoogle />}
                    variant="outline"
                    w="full"
                    h="50px"
                    mb="6"
                    rounded="xl"
                    fontWeight="medium"
                    _hover={{ bg: "gray.200" }}
                  >
                    Sign In with Google
                  </Button>
                </MotionBox>

                {/* Divider */}
                <Flex mb="6" align="center" justify="center">
                  <Box w="full" borderBottom="1px" borderColor="gray.200" />
                  <Text mx="2" color={textColor}>or</Text>
                  <Box w="full" borderBottom="1px" borderColor="gray.200" />
                </Flex>

                {/* Form fields with animation */}
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {/* Email Field */}
                  <FormControl mb="3">
                    <FormLabel fontSize="sm" fontWeight="normal">Email</FormLabel>
                    <Input
                      variant="flushed"
                      type="email"
                      placeholder="mail@globalindiacorp.com"
                      border="1px solid #e0e0e0"
                      borderRadius={7}
                      h="50px"
                      p="12px"
                      fontSize="16px"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>

                  {/* Password Field */}
                  <FormControl mb="3">
                    <FormLabel fontSize="sm" fontWeight="normal">Password</FormLabel>
                    <Flex position="relative">
                      <Input
                        variant="flushed"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        border="1px solid #e0e0e0"
                        borderRadius={7}
                        h="50px"
                        p="12px"
                        fontSize="16px"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        position="absolute"
                        right="2"
                        top="50%"
                        transform="translateY(-50%)"
                        h="30px"
                        w="30px"
                        minW="30px"
                        p="0"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </Flex>
                  </FormControl>

                  {/* Remember Me and Forgot Password */}
                  <Flex mb="5" justify="space-between" align="center">
                    <Flex align="center">
                      <Checkbox
                        isChecked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Text ml="3" fontSize="sm" color={textColor}>Keep me logged In</Text>
                    </Flex>
                    <Link
                      onClick={() => history.push("/auth/forgot-password")}
                      fontSize="sm"
                      fontWeight="medium"
                      color={companyBlue}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Forgot Password?
                    </Link>
                  </Flex>

                  {/* Sign In Button */}
                  <Button
                    w="full"
                    rounded="xl"
                    bg={`linear-gradient(to right, #005bbb, ${companyBlue})`}
                    color="white"
                    py="12px"
                    _hover={{ bg: `linear-gradient(to right, #004a99, #002244)` }}
                    onClick={handleSignIn}
                    isLoading={isLoading}
                  >
                    Secure Login
                  </Button>

                  {/* Create Account Link */}
                  <Flex mt="5" justify="center">
                    <Text fontSize="sm" color={textColor}>Don't have an account?</Text>
                    <Link
                      ml="1"
                      fontSize="sm"
                      fontWeight="medium"
                      color={companyBlue}
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => history.push("/auth/signup")}
                    >
                      Contact IT Support
                    </Link>
                  </Flex>
                </MotionBox>
              </Flex>

              {/* Right Column (Image Container) with Company Information */}
              <Box
                w={{ base: "0%", md: "50%" }}
                position="relative"
                display={{ base: "none", md: "block" }}
                overflow="hidden"
              >
                {/* Background Image */}
                <Box
                  position="absolute"
                  top="0"
                  right="0"
                  bottom="0"
                  left="0"
                  bgImage="url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)"
                  bgSize="cover"
                  bgPosition="center"
                  filter="brightness(0.7)"
                />
                
                {/* Content Overlay */}
                <Flex
                  position="absolute"
                  top="0"
                  right="0"
                  bottom="0"
                  left="0"
                  direction="column"
                  justify="center"
                  align="center"
                  p="10"
                  bg="rgba(0, 51, 102, 0.7)"
                >
                  <MotionBox
                    textAlign="center"
                    color="white"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <Heading as="h3" size="lg" mb="6">
                      Building Tomorrow's India Today
                    </Heading>
                    <Text fontSize="md" mb="8">
                      Global India Corporation is at the forefront of India's infrastructure revolution, delivering world-class engineering solutions across energy, transportation, defense, and smart cities.
                    </Text>
                    <Text fontWeight="bold" fontSize="lg" mb="2">
                      Employee Portal Benefits:
                    </Text>
                    <Flex direction="column" align="center">
                      <Text mb="2">✓ Access project dashboards</Text>
                      <Text mb="2">✓ Review work assignments</Text>
                      <Text mb="2">✓ Submit time sheets and reports</Text>
                      <Text mb="2">✓ Collaborate with team members</Text>
                      <Text mb="2">✓ Access HR services and benefits</Text>
                    </Flex>
                  </MotionBox>
                </Flex>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}