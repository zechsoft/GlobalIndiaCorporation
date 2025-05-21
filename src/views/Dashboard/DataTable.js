import React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Tooltip } from "@chakra-ui/react";
import { PencilIcon } from "@heroicons/react/24/solid";

const DataTable = ({ columns, data, handleEditRow }) => {
  return (
    <Table variant="simple" borderRadius="10px" overflow="hidden">
      <Thead bg="gray.100" height="60px">
        <Tr>
          {columns.map((column) => (
            <Th key={column} color="gray.400">{column}</Th>
          ))}
          <Th color="gray.400">Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row) => (
          <Tr key={row.id}>
            {columns.map((column) => (
              <Td key={column}>{row[column.toLowerCase().replace(/ /g, "")]}</Td>
            ))}
            <Td>
              <Tooltip label="Edit">
                <IconButton
                  variant="outline"
                  aria-label="Edit"
                  icon={<PencilIcon />}
                  size="xs"
                  onClick={() => handleEditRow(row.id)}
                />
              </Tooltip>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default DataTable;