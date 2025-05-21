import React, { useState, useEffect } from "react";
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
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const blueShade = useColorModeValue("#0072ff", "#0072ff");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true); // Assume token is valid initially
  
  const toast = useToast();
  const history = useHistory();
  
  // Validate the token when the component mounts
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.post("/api/validate-reset-token", { token });
        
        if (!response.data.valid) {
          setTokenValid(false);
          setError("This password reset link is invalid or has expired.");
        }
      } catch (err) {
        setTokenValid(false);
        setError("This password reset link is invalid or has expired.");
      }
    };
    
    validateToken();
  }, [token]);
  
  const handlePasswordToggle = () => setShowPassword(!showPassword);
  const handleConfirmPasswordToggle = () => setShowConfirmPassword(!showConfirmPassword);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Validation
    if (!password) {
      setError("Please enter a new password");
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Send request to reset password with token
      await axios.post("/api/reset-password", { 
        token,
        password 
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Password Reset",
        description: "Your password has been reset successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        history.push("/auth/signin");
      }, 3000);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.response?.data?.error || "An error occurred. Please try again.");
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to reset password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
            Reset Password
          </Text>
          
          {!isSuccess ? (
            <>
              {tokenValid ? (
                <>
                  <Text mb="9" textAlign="center" color={textColor}>
                    Enter your new password below.
                  </Text>

                  <FormControl mb="4">
                    <FormLabel fontSize="sm" fontWeight="normal">New Password</FormLabel>
                    <InputGroup>
                      <Input
                        variant="flushed"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        border="1px solid #e0e0e0"
                        borderRadius={7}
                        h="50px"
                        p="12px"
                        fontSize="16px"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={error !== ""}
                      />
                      <InputRightElement h="50px">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={handlePasswordToggle}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl mb="6">
                    <FormLabel fontSize="sm" fontWeight="normal">Confirm Password</FormLabel>
                    <InputGroup>
                      <Input
                        variant="flushed"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        border="1px solid #e0e0e0"
                        borderRadius={7}
                        h="50px"
                        p="12px"
                        fontSize="16px"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isInvalid={error !== ""}
                      />
                      <InputRightElement h="50px">
                        <IconButton
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={handleConfirmPasswordToggle}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {error && (
                      <Text color="red.500" fontSize="sm" mt="2">
                        {error}
                      </Text>
                    )}
                  </FormControl>
                  
                  <Button
                    w="full"
                    rounded="xl"
                    bg="linear-gradient(to right, #00c6ff, #0072ff)"
                    color="white"
                    py="12px"
                    isLoading={isSubmitting}
                    loadingText="Resetting..."
                    _hover={{ bg: "linear-gradient(to right, #00a1cc, #005bbb)" }}
                    onClick={handleSubmit}
                  >
                    Reset Password
                  </Button>
                </>
              ) : (
                <VStack spacing={4} textAlign="center">
                  <Text color="red.500">
                    {error}
                  </Text>
                  <Text color={textColor}>
                    Please request a new password reset link.
                  </Text>
                </VStack>
              )}
            </>
          ) : (
            <VStack spacing={4}>
              <Text textAlign="center" color="green.500" fontWeight="bold">
                Password reset successful!
              </Text>
              <Text textAlign="center" color={textColor}>
                Your password has been updated successfully.
              </Text>
              <Text textAlign="center" color={textColor}>
                Redirecting to login page...
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
              cursor="pointer"
            >
              Back to Login
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}