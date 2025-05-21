import { Avatar, Badge, Button, Flex, Td, Text, Tr, useColorModeValue } from "@chakra-ui/react";  // Add useColorModeValue here

function TablesTableRow({
  customerNumber,
  logo,
  name,
  email,
  buyer,
  domain,
  status,
  documentStatus,
  abnormalInfo,
  invitee,
  reauthPerson,
  contactInfo,
  date,
  isLast,
  invitationDate,
}) {
  const textColor = useColorModeValue("gray.500", "white");
  const titleColor = useColorModeValue("gray.700", "white");
  const bgStatus = useColorModeValue("gray.400", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const displayStatus = status || "Offline";
  const displayDate = date || "N/A";
  const displayInvitationDate = invitationDate || "Not Available";
  
  const formattedDate = displayDate === "N/A" ? displayDate : new Date(displayDate).toLocaleDateString();
  const formattedInvitationDate = displayInvitationDate === "Not Available" ? displayInvitationDate : new Date(displayInvitationDate).toLocaleDateString();

  return (
    <Tr>
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Flex direction="column">
          <Text fontSize="sm" color="gray.400" fontWeight="normal">
            {customerNumber}
          </Text>
        </Flex>
      </Td>
      {/* Customer/Logo Column */}
      <Td
        minWidth={{ sm: "250px" }}
        pl="0px"
        borderColor={borderColor}
        borderBottom={isLast ? "none" : null}
      >
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Avatar src={logo} w="50px" borderRadius="12px" me="18px" />
          <Flex direction="column">
            <Text fontSize="md" color={titleColor} fontWeight="bold" minWidth="100%">
              {name}
            </Text>
            <Text fontSize="sm" color="gray.400" fontWeight="normal">
              {email}
            </Text>
          </Flex>
        </Flex>
      </Td>

      {/* Domain/buyer Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Flex direction="column">
          <Text fontSize="md" color={textColor} fontWeight="bold">
            {domain}
          </Text>
        </Flex>
      </Td>
      
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Flex direction="column">
          <Text fontSize="sm" color="gray.400" fontWeight="normal">
            {buyer}
          </Text>
        </Flex>
      </Td>

      {/* Status Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Badge
          bg={displayStatus === "Online" ? "green.400" : bgStatus}
          color="white"
          fontSize="16px"
          p="3px 10px"
          borderRadius="8px"
        >
          {displayStatus}
        </Badge>
      </Td>

      {/* Document Status Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {documentStatus || "Not Available"}
        </Text>
      </Td>

      {/* Abnormal Info Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {abnormalInfo || "None"}
        </Text>
      </Td>

      {/* Invitee Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {invitee || "N/A"}
        </Text>
      </Td>
     
      {/* Re-auth Person Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {reauthPerson || "Not Assigned"}
        </Text>
      </Td>

      {/* Contact Info Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {contactInfo || "No Contact Info"}
        </Text>
      </Td>

      {/* Date Column */}

      {/* Invitation Date Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Text fontSize="md" color={textColor} fontWeight="bold" pb=".5rem">
          {formattedInvitationDate}
        </Text>
      </Td>
      {/* Edit Button Column */}
      <Td borderColor={borderColor} borderBottom={isLast ? "none" : null}>
        <Button p="0px" bg="transparent" variant="no-effects">
          <Text fontSize="md" color="gray.400" fontWeight="bold" cursor="pointer">
            Edit
          </Text>
        </Button>
      </Td>
    </Tr>
  );
}

export default TablesTableRow;
