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
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

export default function ForgotPassword() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const blueShade = useColorModeValue("#0072ff", "#0072ff");
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const toast = useToast();
  const history = useHistory();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simple validation
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Email sent",
        description: "Password reset instructions have been sent to your email",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };
  
  const handleBackToLogin = () => {
    history.push("/auth/signin");
  };
  
  return (
    <Flex direction="column" align="center" minH="80vh">
      <Flex position="relative" mt="40px" justifyContent="center" alignItems="center" w="full">
        <Flex
          w={{ base: "90%", md: "450px" }}
          direction="column"
          bg={bgForm}
          p="60px"
          borderRadius="20px"
          boxShadow="0px 5px 14px rgba(67, 55, 226, 0.05)"
        >
          <Text fontSize="4xl" color={textColor} fontWeight="bold" textAlign="center" mb="22px">
            Forgot Password
          </Text>
          
          {!isSuccess ? (
            <>
              <Text mb="9" textAlign="center" color={textColor}>
                Enter your email address to receive password reset instructions.
              </Text>

              <FormControl mb="6">
                <FormLabel fontSize="sm" fontWeight="normal">Email</FormLabel>
                <Input
                  variant="flushed"
                  type="email"
                  placeholder="mail@example.com"
                  border="1px solid #e0e0e0"
                  borderRadius={7}
                  h="50px"
                  p="12px"
                  fontSize="16px"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              
              <Button
                w="full"
                rounded="xl"
                bg="linear-gradient(to right, #00c6ff, #0072ff)"
                color="white"
                py="12px"
                isLoading={isSubmitting}
                loadingText="Sending..."
                _hover={{ bg: "linear-gradient(to right, #00a1cc, #005bbb)" }}
                onClick={handleSubmit}
              >
                Send Reset Link
              </Button>
            </>
          ) : (
            <VStack spacing={4}>
              <Text textAlign="center" color={textColor}>
                Password reset link has been sent to <strong>{email}</strong>.
              </Text>
              <Text textAlign="center" color={textColor}>
                Please check your email and follow the instructions to reset your password.
              </Text>
            </VStack>
          )}
          
          <Flex mt="5" justify="center">
            <Link
              fontSize="sm"
              fontWeight="medium"
              color={blueShade}
              _hover={{ textDecoration: "underline" }}
              onClick={handleBackToLogin}
            >
              Back to Login
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}