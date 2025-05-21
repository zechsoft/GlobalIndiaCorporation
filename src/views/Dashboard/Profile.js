import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Image,
  Link,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import avatar4 from "assets/img/avatars/avatar4.png";
import avatar5 from "assets/img/avatars/avatar5.png";
import avatar6 from "assets/img/avatars/avatar6.png";
import ImageArchitect1 from "assets/img/ImageArchitect1.png";
import ImageArchitect2 from "assets/img/ImageArchitect2.png";
import ImageArchitect3 from "assets/img/ImageArchitect3.png";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import React, { useState, useEffect } from "react";
import {
  FaCube,
  FaFacebook,
  FaInstagram,
  FaPenFancy,
  FaPlus,
  FaTwitter,
} from "react-icons/fa";
import { IoDocumentsSharp } from "react-icons/io5";
import axios from "axios";

function Profile() {
  const { colorMode } = useColorMode();
  const [activeSection, setActiveSection] = useState("overview");
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const toast = useToast();
  
  // Get user from storage
  var user = JSON.parse(localStorage.getItem("user"));
  if(!user || Object.keys(user).length <= 0) {
    user = JSON.parse(sessionStorage.getItem("user"));
  }

  // Initialize profile state
  const [profileInfo, setProfileInfo] = useState({
    fullName: user.name || "",
    mobile: user.mobile || "",
    email: user.email || "",
    location: user.location || "",
    bio: user.bio || "",
  });

  // Project states
  const [selectedProject, setSelectedProject] = useState(null);
  const [profileImage, setProfileImage] = useState(
    user.profileImage ? 
      user.profileImage.startsWith('/uploads') ? 
        `https://globalindiabackendnew.onrender.com${user.profileImage}` : 
        user.profileImage 
      : avatar5
  );
  const [projects, setProjects] = useState([]);

  // UI colors
  const textColor = useColorModeValue("gray.700", "white");
  const iconColor = useColorModeValue("blue.500", "white");
  const bgProfile = useColorModeValue("hsla(0,0%,100%,.8)", "navy.800");
  const borderProfileColor = useColorModeValue("white", "transparent");
  const emailColor = useColorModeValue("gray.400", "gray.300");

  // Modal control
  const { isOpen: isProjectModalOpen, onOpen: openProjectModal, onClose: closeProjectModal } = useDisclosure();

  // Load user projects on component mount
  useEffect(() => {
    loadUserProjects();
  }, []);

  // Load user projects from the backend
  const loadUserProjects = async () => {
    try {
      const response = await axios.post("https://globalindiabackendnew.onrender.com/api/get-projects", {
        email: user.email
      }, {
        withCredentials: true
      });
      
      if (response.status === 200 && response.data.projects) {
        // Format project images with proper URLs
        const formattedProjects = response.data.projects.map(project => ({
          ...project,
          image: project.image && project.image.startsWith('/uploads') ? 
            `https://globalindiabackendnew.onrender.com${project.image}` : 
            project.image
        }));
        
        setProjects(formattedProjects);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
      toast({
        title: "Failed to load projects",
        description: "There was an error loading your projects",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Profile editing handlers
  const handleEditProfileClick = () => {
    if (isProfileEditing) {
      // Save the profile info
      saveProfileInfo();
    } else {
      // Enter edit mode
      setIsProfileEditing(true);
    }
  };

  const saveProfileInfo = async() => {
    try {
      const response = await axios.post("https://globalindiabackendnew.onrender.com/api/edit-user", {
        data: profileInfo
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        // Update localStorage/sessionStorage with new user data
        const updatedUser = {
          ...user,
          name: profileInfo.fullName,
          email: profileInfo.email,
          mobile: profileInfo.mobile,
          location: profileInfo.location,
          bio: profileInfo.bio
        };
        
        if (localStorage.getItem("user")) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem("user", JSON.stringify(updatedUser));
        }
        
        setIsProfileEditing(false);
        // Display success notification
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      // Display error notification
      toast({
        title: "Update failed",
        description: "There was an error updating your profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Profile info change handler
  const handleProfileInfoChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo({ ...profileInfo, [name]: value });
  };

  // Profile image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("email", profileInfo.email);
      
      try {
        // First update the preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Then send to server
        const response = await axios.post("https://globalindiabackendnew.onrender.com/api/upload-profile-image", 
          formData, 
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.status === 200) {
          // Update localStorage with the new image URL
          const updatedUser = { ...user, profileImage: response.data.imageUrl };
          if (localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          }
          
          // Update profile image state with full URL if needed
          setProfileImage(
            response.data.imageUrl.startsWith('/uploads') ? 
              `https://globalindiabackendnew.onrender.com${response.data.imageUrl}` : 
              response.data.imageUrl
          );
          
          toast({
            title: "Image uploaded",
            description: "Your profile image has been updated",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your profile image",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Project handlers
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setActiveSection("projects");
  };

  const handleProjectEditClick = (project) => {
    setSelectedProject({
      ...project,
      image: project.image && project.image.startsWith('/uploads') ? 
        `https://globalindiabackendnew.onrender.com${project.image}` : 
        project.image
    });
    openProjectModal();
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setSelectedProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleProjectImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProject((prevProject) => ({
          ...prevProject,
          image: reader.result, // This is just for preview
          imageFile: file // Store the actual file for later upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProject = async () => {
    if (!selectedProject) return;
    
    try {
      // First save the project data
      let projectResponse;
      
      // If it's a new project (no id), add it
      if (!selectedProject.id) {
        projectResponse = await axios.post("https://globalindiabackendnew.onrender.com/api/add-project", {
          project: {
            name: selectedProject.name,
            description: selectedProject.description,
            image: selectedProject.image && !selectedProject.imageFile ? selectedProject.image : null
          },
          email: profileInfo.email
        }, {
          withCredentials: true
        });
        
        if (projectResponse.status !== 200) {
          throw new Error("Failed to create project");
        }
      } else {
        // Update existing project
        projectResponse = await axios.post("https://globalindiabackendnew.onrender.com/api/update-project", {
          project: {
            id: selectedProject.id,
            name: selectedProject.name,
            description: selectedProject.description,
            image: selectedProject.image && !selectedProject.imageFile ? selectedProject.image : undefined
          },
          email: profileInfo.email
        }, {
          withCredentials: true
        });
        
        if (projectResponse.status !== 200) {
          throw new Error("Failed to update project");
        }
      }
      
      // If there's a new image file, upload it separately
      if (selectedProject.imageFile) {
        const formData = new FormData();
        formData.append("projectImage", selectedProject.imageFile);
        formData.append("projectId", selectedProject.id || projectResponse.data.projectId);
        
        const imageResponse = await axios.post(
          "https://globalindiabackendnew.onrender.com/api/upload-project-image",
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (imageResponse.status !== 200) {
          throw new Error("Failed to upload project image");
        }
        
        // Update the project with the new image URL from the server
        const updatedProject = {
          ...selectedProject,
          id: selectedProject.id || projectResponse.data.projectId,
          image: imageResponse.data.imageUrl.startsWith('/uploads') ? 
            `https://globalindiabackendnew.onrender.com${imageResponse.data.imageUrl}` : 
            imageResponse.data.imageUrl,
          imageFile: null // Clear the file reference
        };
        
        // Update projects list with the new/updated project
        setProjects(prev => {
          if (selectedProject.id) {
            // Update existing project
            return prev.map(p => p.id === selectedProject.id ? updatedProject : p);
          } else {
            // Add new project
            return [...prev, updatedProject];
          }
        });
      } else {
        // No new image, just update the projects list
        const updatedProject = {
          ...selectedProject,
          id: selectedProject.id || projectResponse.data.projectId
        };
        
        setProjects(prev => {
          if (selectedProject.id) {
            // Update existing project
            return prev.map(p => p.id === selectedProject.id ? updatedProject : p);
          } else {
            // Add new project
            return [...prev, updatedProject];
          }
        });
      }
      
      closeProjectModal();
      toast({
        title: "Project saved",
        description: "Your project has been saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error saving project:", err);
      toast({
        title: "Save failed",
        description: err.message || "There was an error saving your project",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add a new project
  const handleAddProject = () => {
    setSelectedProject({
      id: null, // Backend will assign an ID
      name: "",
      description: "",
      image: ImageArchitect1, // Default image
    });
    openProjectModal();
  };

  // Delete a project
  const handleDeleteProject = async (projectId) => {
    try {
      const response = await axios.post("https://globalindiabackendnew.onrender.com/api/delete-project", {
        projectId: projectId,
        email: profileInfo.email
      }, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setProjects(projects.filter(project => project.id !== projectId));
        toast({
          title: "Project deleted",
          description: "Your project has been deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your project",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px", lg: "100px" }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        mb="24px"
        maxH="330px"
        justifyContent={{ base: "center", md: "space-between" }}
        align="center"
        backdropFilter="blur(21px)"
        boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.02)"
        border="1.5px solid"
        borderColor={borderProfileColor}
        bg={bgProfile}
        p="24px"
        borderRadius="20px">
        <Flex
          align="center"
          mb={{ base: "10px", md: "0px" }}
          direction={{ base: "column", md: "row" }}
          w={{ base: "100%" }}
          textAlign={{ base: "center", md: "start" }}>
          <Avatar
            me={{ md: "22px" }}
            src={profileImage}
            w="80px"
            h="80px"
            borderRadius="15px"
          />
          <Flex direction="column" maxWidth="100%" my={{ base: "14px" }}>
            <Text
              fontSize={{ base: "lg", lg: "xl" }}
              color={textColor}
              fontWeight="bold"
              ms={{ base: "8px", md: "0px" }}>
              {profileInfo.fullName}
            </Text>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color={emailColor}
              fontWeight="semibold">
              {profileInfo.email}
            </Text>
          </Flex>
        </Flex>
        <Flex
          direction={{ base: "column", lg: "row" }}
          w={{ base: "100%", md: "50%", lg: "auto" }}>
          <Button p="0px" bg="transparent" variant="no-effects" onClick={() => setActiveSection("overview")}>
            <Flex
              align="center"
              w={{ base: "100%", lg: "135px" }}
              bg={activeSection === "overview" ? "#fff" : "transparent"}
              borderRadius="8px"
              justifyContent="center"
              py="10px"
              boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.06)"
              cursor="pointer">
              <Icon color={textColor} as={FaCube} me="6px" />
              <Text fontSize="xs" color={textColor} fontWeight="bold">
                OVERVIEW
              </Text>
            </Flex>
          </Button>
          <Button p="0px" bg="transparent" variant="no-effects" onClick={() => setActiveSection("info")}>
            <Flex
              align="center"
              w={{ lg: "135px" }}
              borderRadius="8px"
              justifyContent="center"
              py="10px"
              mx={{ lg: "1rem" }}
              bg={activeSection === "info" ? "#fff" : "transparent"}
              boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.06)"
              cursor="pointer">
              <Icon color={textColor} as={IoDocumentsSharp} me="6px" />
              <Text fontSize="xs" color={textColor} fontWeight="bold">
                INFO
              </Text>
            </Flex>
          </Button>
          <Button p="0px" bg="transparent" variant="no-effects" onClick={() => setActiveSection("projects")}>
            <Flex
              align="center"
              w={{ lg: "135px" }}
              borderRadius="8px"
              justifyContent="center"
              py="10px"
              boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.06)"
              bg={activeSection === "projects" ? "#fff" : "transparent"}
              cursor="pointer">
              <Icon color={textColor} as={FaPenFancy} me="6px" />
              <Text fontSize="xs" color={textColor} fontWeight="bold">
                PROJECTS
              </Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>

      {activeSection === "overview" && (
        <Grid templateColumns="1fr" gap="22px">
          <Card p="16px" my={{ base: "24px", xl: "0px" }}>
            <CardHeader p="12px 5px" mb="12px">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Profile Information
              </Text>
            </CardHeader>
            <CardBody px="5px">
              <Flex direction="column">
                <Text fontSize="md" color="gray.400" fontWeight="400" mb="30px">
                  {profileInfo.bio}
                </Text>
                <Flex align="center" mb="18px">
                  <Text fontSize="md" color={textColor} fontWeight="bold" me="10px">
                    Full Name:{" "}
                  </Text>
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.fullName}
                  </Text>
                </Flex>
                <Flex align="center" mb="18px">
                  <Text fontSize="md" color={textColor} fontWeight="bold" me="10px">
                    Mobile:{" "}
                  </Text>
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.mobile}
                  </Text>
                </Flex>
                <Flex align="center" mb="18px">
                  <Text fontSize="md" color={textColor} fontWeight="bold" me="10px">
                    Email:{" "}
                  </Text>
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.email}
                  </Text>
                </Flex>
                <Flex align="center" mb="18px">
                  <Text fontSize="md" color={textColor} fontWeight="bold" me="10px">
                    Location:{" "}
                  </Text>
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.location}
                  </Text>
                </Flex>
                <Flex align="center" mb="18px">
                  <Text fontSize="md" color={textColor} fontWeight="bold" me="10px">
                    Social Media:{" "}
                  </Text>
                  <Flex>
                    <Link href="#" color={iconColor} fontSize="lg" me="10px" _hover={{ color: "blue.500" }}>
                      <Icon as={FaFacebook} />
                    </Link>
                    <Link href="#" color={iconColor} fontSize="lg" me="10px" _hover={{ color: "blue.500" }}>
                      <Icon as={FaInstagram} />
                    </Link>
                    <Link href="#" color={iconColor} fontSize="lg" me="10px" _hover={{ color: "blue.500" }}>
                      <Icon as={FaTwitter} />
                    </Link>
                  </Flex>
                </Flex>
              </Flex>
            </CardBody>
          </Card>
          <Card p="16px" my="24px">
            <CardHeader p="12px 5px" mb="12px">
              <Flex direction="column">
                <Text fontSize="lg" color={textColor} fontWeight="bold">
                  Projects
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="400">
                  Architects design houses
                </Text>
              </Flex>
            </CardHeader>
            <CardBody px="5px">
              <Grid
                templateColumns="repeat(2, 1fr)" // Adjusted to display two columns
                gap="24px"
                autoRows="auto" // Ensures rows are created as needed
                autoFlow="row dense" // Ensures items are placed in the densest possible arrangement
              >
                {projects.map((project, index) => (
                  <Flex direction="column" key={index} onClick={() => handleProjectClick(project)}>
                    <Box mb="20px" position="relative" borderRadius="15px">
                      <Image 
                        src={project.image && project.image.startsWith('/uploads') ? 
                          `https://globalindiabackendnew.onrender.com${project.image}` : 
                          project.image} 
                        borderRadius="15px" 
                      />
                      <Box
                        w="100%"
                        h="100%"
                        position="absolute"
                        top="0"
                        borderRadius="15px"
                        bg="linear-gradient(360deg, rgba(49, 56, 96, 0.16) 0%, rgba(21, 25, 40, 0.88) 100%)"></Box>
                    </Box>
                    <Flex direction="column">
                      <Text fontSize="md" color="gray.400" fontWeight="600" mb="10px">
                        Project #{index + 1}
                      </Text>
                      <Text fontSize="xl" color={textColor} fontWeight="bold" mb="10px">
                        {project.name}
                      </Text>
                      <Text fontSize="md" color="gray.400" fontWeight="400" mb="20px">
                        {project.description}
                      </Text>
                      <Flex justifyContent="space-between">
                        <Button 
                          variant="dark" 
                          minW="110px" 
                          h="36px" 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent's onClick
                            handleProjectEditClick(project);
                          }}
                        >
                          EDIT
                        </Button>
                        <Button 
                          colorScheme="red" 
                          minW="110px" 
                          h="36px" 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent's onClick
                            handleDeleteProject(project.id);
                          }}
                        >
                          DELETE
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                ))}
                <Flex 
                  direction="column" 
                  justifyContent="center" 
                  alignItems="center" 
                  borderWidth="1px" 
                  borderRadius="15px" 
                  borderStyle="dashed" 
                  p="20px"
                  cursor="pointer"
                  onClick={handleAddProject}
                >
                  <Icon as={FaPlus} fontSize="3xl" mb="10px" />
                  <Text fontSize="lg" fontWeight="bold">Add New Project</Text>
                </Flex>
              </Grid>
            </CardBody>
          </Card>
        </Grid>
      )}

      {activeSection === "info" && (
        <Card p="16px" my="24px">
          <CardHeader p="12px 5px" mb="12px">
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                {isProfileEditing ? "Edit Profile Information" : "Profile Information"}
              </Text>
              <Button onClick={handleEditProfileClick} colorScheme="blue" size="sm">
                {isProfileEditing ? "Save" : "Edit"}
              </Button>
            </Flex>
          </CardHeader>
          <CardBody px="5px">
            <Flex direction="column">
              <Flex align="center" mb="18px">
                <Text fontSize="md" color={textColor} fontWeight="bold" me="10px" width="100px">
                  Full Name:
                </Text>
                {isProfileEditing ? (
                  <Input
                    name="fullName"
                    value={profileInfo.fullName}
                    onChange={handleProfileInfoChange}
                  />
                ) : (
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.fullName}
                  </Text>
                )}
              </Flex>
              
              <Flex align="center" mb="18px">
                <Text fontSize="md" color={textColor} fontWeight="bold" me="10px" width="100px">
                  Mobile:
                </Text>
                {isProfileEditing ? (
                  <Input
                    name="mobile"
                    value={profileInfo.mobile}
                    onChange={handleProfileInfoChange}
                  />
                ) : (
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.mobile}
                  </Text>
                )}
              </Flex>
              
              <Flex align="center" mb="18px">
                <Text fontSize="md" color={textColor} fontWeight="bold" me="10px" width="100px">
                  Email:
                </Text>
                {isProfileEditing ? (
                  <Input
                    name="email"
                    value={profileInfo.email}
                    onChange={handleProfileInfoChange}
                  />
                ) : (
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.email}
                  </Text>
                )}
              </Flex>
              
              <Flex align="center" mb="18px">
                <Text fontSize="md" color={textColor} fontWeight="bold" me="10px" width="100px">
                  Location:
                </Text>
                {isProfileEditing ? (
                  <Input
                    name="location"
                    value={profileInfo.location}
                    onChange={handleProfileInfoChange}
                  />
                ) : (
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.location}
                  </Text>
                )}
              </Flex>
              
              <Flex align="center" mb="18px">
                <Text fontSize="md" color={textColor} fontWeight="bold" me="10px" width="100px">
                  Bio:
                </Text>
                {isProfileEditing ? (
                  <Textarea
                    name="bio"
                    value={profileInfo.bio}
                    onChange={handleProfileInfoChange}
                  />
                ) : (
                  <Text fontSize="md" color="gray.400" fontWeight="400">
                    {profileInfo.bio}
                  </Text>
                )}
              </Flex>
              
              {isProfileEditing && (
                <Flex align="center" mb="18px">
                  <Text fontSize="md" color={textColor} fontWeight="bold" me="10px" width="100px">
                    Profile Image:
                  </Text>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Flex>
              )}
            </Flex>
          </CardBody>
        </Card>
      )}

      {activeSection === "projects" && (
        <Card p="16px" my="24px">
          <CardHeader p="12px 5px" mb="12px">
            <Flex justify="space-between" align="center">
              <Flex direction="column">
                <Text fontSize="lg" color={textColor} fontWeight="bold">
                  Projects
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="400">
                  Architects design houses
                </Text>
              </Flex>
              <Button 
                leftIcon={<FaPlus />} 
                colorScheme="blue" 
                onClick={handleAddProject}
              >
                Add Project
              </Button>
            </Flex>
          </CardHeader>
          
          <CardBody px="5px">
            <Grid
              templateColumns="repeat(2, 1fr)"
              gap="24px">
              {projects.map((project, index) => (
                <Flex direction="column" key={index}>
                  <Box mb="20px" position="relative" borderRadius="15px">
                    <Image
                      src={project.image && project.image.startsWith('/uploads') ? 
                        `https://globalindiabackendnew.onrender.com${project.image}` : 
                        project.image}
                      borderRadius="15px"
                      w="100%"
                      h="400px"
                      objectFit="cover"
                    />
                    <Box
                      w="100%"
                      h="100%"
                      position="absolute"
                      top="0"
                      borderRadius="15px"
                      bg="linear-gradient(360deg, rgba(49, 56, 96, 0.16) 0%, rgba(21, 25, 40, 0.88) 100%)"></Box>
                  </Box>
                  <Flex direction="column">
                    <Text fontSize="md" color="gray.400" fontWeight="600" mb="10px">
                      Project #{index + 1}
                    </Text>
                    <Text fontSize="xl" color={textColor} fontWeight="bold" mb="10px">
                      {project.name}
                    </Text>
                    <Text fontSize="md" color="gray.400" fontWeight="400" mb="20px">
                      {project.description}
                    </Text>
                    <Flex justifyContent="space-between">
                      <Button 
                        variant="dark" 
                        minW="110px" 
                        h="36px" 
                        onClick={() => handleProjectEditClick(project)}
                      >
                        EDIT
                      </Button>
                      <Button 
                        colorScheme="red" 
                        minW="110px" 
                        h="36px" 
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        DELETE
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Grid>
          </CardBody>
        </Card>
      )}

      {/* Project Edit Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={closeProjectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedProject && selectedProject.id ? "Edit Project" : "Add New Project"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProject && (
              <>
                <Input
                  name="name"
                  value={selectedProject.name}
                  onChange={handleProjectChange}
                  mb="18px"
                  placeholder="Project Name"
                />
                <Textarea
                  name="description"
                  value={selectedProject.description}
                  onChange={handleProjectChange}
                  mb="18px"
                  placeholder="Project Description"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProjectImageUpload}
                  mb="18px"
                  placeholder="Upload Project Image"
                />
                {selectedProject.image && (
                  <Image 
                    src={selectedProject.image} 
                    borderRadius="8px" 
                    maxH="200px" 
                    objectFit="cover"
                    mx="auto"
                    mb="18px"
                  />
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveProject}>
              Save
            </Button>
            <Button onClick={closeProjectModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default Profile;