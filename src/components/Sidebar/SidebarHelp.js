import {
  Button,
  Flex,
  Image,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import SidebarHelpImage from "assets/img/SidebarHelpImage.png";
import React from "react";

export function SidebarHelp(props) {
  // Pass the computed styles into the `__css` prop
  const { children, sidebarVariant, ...rest } = props;
  const textColor = useColorModeValue("gray.700", "white");
  const { colorMode } = useColorMode();
  return (
    <Stack
      justify='center'
      direction='column'
      align='center'
      p='10px'
      spacing='2px'
      mb="22px"
      mt="auto"
      mx='20px'>
      <Image src={SidebarHelpImage} w='110px' h="auto" />
      <Flex direction='column' textAlign='center'>
        <Text fontSize='14px' color={textColor} fontWeight='bold'>
          Mugil's page 
        </Text>
        <Text fontSize='12px' color='gray.500'>
          Please check our profile.
        </Text>
      </Flex>
      
    </Stack>
  );
}
