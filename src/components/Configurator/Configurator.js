import { 
  Box, 
  Button, 
  Drawer, 
  DrawerBody, 
  DrawerCloseButton, 
  DrawerContent, 
  DrawerHeader, 
  Flex, 
  Switch, 
  Text, 
  useColorMode, 
  useColorModeValue, 
  Select
} from "@chakra-ui/react"; 
import { HSeparator } from "components/Separator/Separator"; 
import React, { useState } from "react"; 
import { motion } from "framer-motion"; // Import motion from framer-motion

// Wrap Chakra components with motion
const MotionSelect = motion(Select); // Now MotionSelect is a Chakra Select component with animation capabilities

export default function Configurator(props) { 
  const { 
    sidebarVariant, 
    setSidebarVariant, 
    secondary, 
    isOpen, 
    onClose, 
    fixed, 
    ...rest 
  } = props; 

  const [switched, setSwitched] = useState(props.isChecked);  
  const { colorMode, toggleColorMode } = useColorMode(); 

  let bgButton = useColorModeValue( 
    "linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)", 
    "white" 
  ); 
  let colorButton = useColorModeValue("white", "gray.700"); 
  const secondaryButtonBg = useColorModeValue("white", "transparent"); 
  const secondaryButtonBorder = useColorModeValue("gray.700", "white"); 
  const secondaryButtonColor = useColorModeValue("gray.700", "white"); 
  const bgDrawer = useColorModeValue("white", "navy.800"); 
  const settingsRef = React.useRef(); 

  // Sample data for users and clients
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Chris Johnson' },
  ];
  
  const clients = [
    { id: 1, name: 'Acme Corp' },
    { id: 2, name: 'Globex Inc.' },
    { id: 3, name: 'Umbrella Corp' },
  ];

  // State to store selected user and client
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  return ( 
    <> 
      <Drawer 
        isOpen={props.isOpen} 
        onClose={props.onClose} 
        placement={document.documentElement.dir === "rtl" ? "left" : "right"} 
        finalFocusRef={settingsRef} 
        blockScrollOnMount={false} 
      > 
        <DrawerContent bg={bgDrawer}> 
          <DrawerHeader pt="24px" px="24px"> 
            <DrawerCloseButton /> 
            <Text fontSize="xl" fontWeight="bold" mt="16px"> 
              G I C Configurator 
            </Text> 
            <Text fontSize="md" mb="16px"> 
              See your dashboard options. 
            </Text> 
            <HSeparator /> 
          </DrawerHeader> 
          
          <DrawerBody w="340px" ps="24px" pe="40px"> 
            <Flex flexDirection="column"> 
              <Flex justifyContent="space-between " mb="16px"> 
                <Text fontSize="md" fontWeight="600" mb="4px"> 
                  Navbar Fixed 
                </Text> 
                <Switch 
                  colorScheme="blue" 
                  isChecked={switched} 
                  onChange={() => { 
                    if (switched === true) { 
                      props.onSwitch(false); 
                      setSwitched(false); 
                    } else { 
                      props.onSwitch(true); 
                      setSwitched(true); 
                    } 
                  }} 
                /> 
              </Flex> 
              
              <Flex justifyContent="space-between" alignItems="center" mb="24px">
                <Text fontSize="md" fontWeight="600" mb="4px"> 
                  Dark/Light 
                </Text> 
                <Button 
                  onClick={toggleColorMode} 
                  color={colorMode === "light" ? "Dark" : "Light"}
                  _hover={{ bg: "gray.200" }}
                  transition="all 0.2s ease"
                > 
                  Toggle {colorMode === "light" ? "Dark" : "Light"} 
                </Button> 
              </Flex> 

              <HSeparator />
              
              <Flex flexDirection="row" justifyContent="space-between" mt="24px">
                {/* User Select */}
                <Box flex="1" mr="12px">
                  <MotionSelect
                    placeholder="User"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    _focus={{ borderColor: "blue.400" }}
                    _hover={{ borderColor: "blue.500" }}
                    _active={{ borderColor: "blue.600" }}
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </MotionSelect>
                </Box>

                {/* Client Select */}
                <Box flex="1" ml="12px">
                  <MotionSelect
                    placeholder="Client"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    _focus={{ borderColor: "green.400" }}
                    _hover={{ borderColor: "green.500" }}
                    _active={{ borderColor: "green.600" }}
                  >
                    {clients.map(client => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </MotionSelect>
                </Box>
              </Flex>
            </Flex> 
          </DrawerBody> 
        </DrawerContent> 
      </Drawer> 
    </> 
  ); 
}
