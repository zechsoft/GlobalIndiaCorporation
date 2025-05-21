import React from "react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import TablesProjectRow from "components/Tables/TablesProjectRow";

const ProjectsTable = ({ filteredProjectData, indexOfFirstRow, indexOfLastRow, textColor, borderColor }) => {
  return (
    <Table variant="simple" color={textColor}>
      <Thead>
        <Tr my=".8rem" pl="0px">
          <Th pl="0px" color="gray.400" borderColor={borderColor}>Companies</Th>
          <Th color="gray.400" borderColor={borderColor}>Budget</Th>
          <Th color="gray.400" borderColor={borderColor}>Status</Th>
          <Th color="gray.400" borderColor={borderColor}>Completion</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {filteredProjectData.slice(indexOfFirstRow, indexOfLastRow).map((row, index) => (
          <TablesProjectRow key={index} {...row} isLast={index === filteredProjectData.length - 1} />
        ))}
      </Tbody>
    </Table>
  );
};

export default ProjectsTable;