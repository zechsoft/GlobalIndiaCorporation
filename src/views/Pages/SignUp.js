import React, { useState } from "react";
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
  Select,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  CloseButton,
  VStack,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import axios from "axios";

// Default avatars for new users
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

function SignUp() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const blueShade = useColorModeValue("#0072ff", "#0072ff");
  const companyBlue = "#003366"; // Company primary color

  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const toast = useToast();
  const history = useHistory();
  const API_BASE_URL = "https://globalindiabackendnew.onrender.com/api";

  // Default avatars to assign to new users
  const defaultAvatars = [avatar1, avatar2, avatar3];

  // Modal controls
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "initial";
    history.push("/auth/signin");
  };

  // Handle escape key press
  React.useEffect(() => {
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

  const handleSignUp = async() => {
    setIsLoading(true);

    // Simple validation
    if (!name || !email || !password || !role) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    // Password validation (min 8 characters)
    if (password.length < 8) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 8 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if(!otp)
    {
      toast({
        title: "Please enter the OTP",
        description: "No otp found",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try
    {
  const userCheck = await axios.post(`${API_BASE_URL}/check-user`,{"email" : email},
  {
    withCredentials : true
  }
)

      if(userCheck.status === 200)
      {
        const secret = JSON.parse(sessionStorage.getItem("secret"));

        const newUser = {
          "name" : name,
          "email" : email,
          "password" : password,
          "role" : role,
          "otp" : otp,
          "secret" : secret
        };

       const registerUser = await axios.post(`${API_BASE_URL}/registerUser`,{newUser},{
  withCredentials : true
})

        if(registerUser.status === 200)
        {
          setTimeout(() => {
            setIsLoading(false);
            toast({
              title: "Registration Successful",
              description: `Welcome to Global India Corporation, ${name}!`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            history.push("/auth/signin");
          }, 1000);
        }
        else
        {
          toast({
            title: "Reigstration failed",
            description: "There was a problem in user registration please try again later.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setIsLoading(false);
          return;
        }
      }
      else
      {
          toast({
            title: "User already exists",
            description: `User ${name} already exists`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          history.push("/auth/signin");
      }
    }
    catch(err)
    {
      if(err.response.status === 406)
      {
        toast({
          title: "User already exists",
          description: `User ${name} already exists`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        history.push("/auth/signin");
      }
      else
      {
        toast({
          title: "Something went wrong",
          description: `${err.response.data.error}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
    }
  };

  const handleSendOtp = async() => {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please enter your email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simulate OTP sending

    try
    {
      const response = await axios.post(`${API_BASE_URL}/sendotp`)

      if(response.status === 200)
      {
        toast({
          title: "OTP Sent",
          description: "An OTP has been sent to your email address",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        sessionStorage.setItem("secret",JSON.stringify(response.data.secret));
      }
      else
      {
        toast({
          title: "OTP failed",
          description: "There has been a minor inconvenience",
          status: "fail",
          duration: 3000,
          isClosable: true,
        });
      }
    }catch(err)
    {
      toast({
        title: "OTP failed",
        description: "There has been a minor inconvenience",
        status: "fail",
        duration: 3000,
        isClosable: true,
      });
    }

  };

  // Animation variants
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <Flex 
      minH="100vh"
      align="center" 
      justify="center"
      bgImage="url(https://images.unsplash.com/photo-1538137524007-21e48fa42f3f)"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
    >
      {/* Background Overlay */}
      <Box 
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0,0,0,0.6)"
      />
      
      {/* Content */}
      <Box position="relative" w="full" textAlign="center">
        <MotionHeading
          as="h1"
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight="bold"
          textAlign="center"
          mb="6"
          color="white"
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
          mx="auto"
          color="white"
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
          display="flex"
          justifyContent="center"
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
            CREATE ACCOUNT
          </Button>
        </MotionBox>
      </Box>
      
      {/* Registration Modal */}
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
              {/* Left Column (Registration Form) */}
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
                    Create your account to join our team
                  </Text>
                </MotionBox>

                {/* Google Sign-Up Button */}
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
                    Sign Up with Google
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
                  {/* Name Field */}
                  <FormControl mb="3">
                    <FormLabel fontSize="sm" fontWeight="normal">Full Name</FormLabel>
                    <Input
                      variant="flushed"
                      type="text"
                      placeholder="John Doe"
                      border="1px solid #e0e0e0"
                      borderRadius={7}
                      h="50px"
                      p="12px"
                      fontSize="16px"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </FormControl>

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
                    <Input
                      variant="flushed"
                      type="password"
                      placeholder="Min. 8 characters"
                      border="1px solid #e0e0e0"
                      borderRadius={7}
                      h="50px"
                      p="12px"
                      fontSize="16px"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>

                  {/* Role Field */}
                  <FormControl mb="3">
                    <FormLabel fontSize="sm" fontWeight="normal">Role</FormLabel>
                    <Select
                      placeholder="Select role"
                      border="1px solid #e0e0e0"
                      borderRadius={7}
                      h="50px"
                      p="12px"
                      fontSize="16px"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </Select>
                  </FormControl>

                  {/* OTP Field with button */}
                  <FormControl mb="4">
                    <FormLabel fontSize="sm" fontWeight="normal">OTP Verification</FormLabel>
                    <Flex>
                      <Input
                        variant="flushed"
                        type="text"
                        placeholder="Enter OTP"
                        border="1px solid #e0e0e0"
                        borderRadius={7}
                        h="50px"
                        p="12px"
                        fontSize="16px"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        mr="2"
                      />
                      <Button
                        h="50px"
                        onClick={handleSendOtp}
                        bg={`linear-gradient(to right, #005bbb, ${companyBlue})`}
                        color="white"
                        _hover={{ bg: `linear-gradient(to right, #004a99, #002244)` }}
                      >
                        Send OTP
                      </Button>
                    </Flex>
                  </FormControl>

                  {/* Remember Me */}
                  <Flex mb="5" align="center">
                    <Checkbox
                      isChecked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <Text ml="3" fontSize="sm" color={textColor}>Keep me logged in</Text>
                  </Flex>

                  {/* Sign Up Button */}
                  <Button
                    w="full"
                    rounded="xl"
                    bg={`linear-gradient(to right, #005bbb, ${companyBlue})`}
                    color="white"
                    py="12px"
                    _hover={{ bg: `linear-gradient(to right, #004a99, #002244)` }}
                    onClick={handleSignUp}
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>

                  {/* Sign In Link */}
                  <Flex mt="5" justify="center">
                    <Text fontSize="sm" color={textColor}>Already have an account?</Text>
                    <Link
                      ml="1"
                      fontSize="sm"
                      fontWeight="medium"
                      color={companyBlue}
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => history.push("/auth/signin")}
                    >
                      Sign in
                    </Link>
                  </Flex>
                </MotionBox>
              </Flex>

              {/* Right Column (Company Information) */}
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
                  bgImage="url(https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?ixlib=rb-0.3.5&auto=format&fit=crop&w=1000&q=80)"
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
                      Join Our Team
                    </Heading>
                    <Text fontSize="md" mb="8">
                      Global India Corporation is at the forefront of India's infrastructure revolution, delivering world-class engineering solutions across energy, transportation, defense, and smart cities.
                    </Text>
                    <Text fontWeight="bold" fontSize="lg" mb="2">
                      Why Join GIC?
                    </Text>
                    <Flex direction="column" align="center">
                      <Text mb="2">✓ Be part of India's infrastructure revolution</Text>
                      <Text mb="2">✓ Work on landmark national projects</Text>
                      <Text mb="2">✓ Collaborate with industry experts</Text>
                      <Text mb="2">✓ Access cutting-edge technologies</Text>
                      <Text mb="2">✓ Excellent growth and learning opportunities</Text>
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

export default SignUp;