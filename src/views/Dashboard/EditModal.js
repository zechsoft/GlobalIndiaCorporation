import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

// Field configuration for the modal
const fieldConfig = [
  { key: "customerNumber", label: "Customer Number", type: "text" },
  { key: "customer", label: "Customer", type: "text" },
  { key: "buyer", label: "Buyer", type: "text" },
  { key: "secondOrderClassification", label: "Second-order Classification", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "documentStatus", label: "Document Status", type: "text" },
  { key: "abnormalInfo", label: "Abnormal Info", type: "text" },
  { key: "invitee", label: "Invitee", type: "text" },
  { key: "reAuthPerson", label: "Re-auth Person", type: "text" },
  { key: "contactInfo", label: "Contact Info", type: "text" },
  { key: "invitationDate", label: "Invitation Date", type: "date" },
];

const EditModal = ({ isOpen, onClose, newRow, setNewRow, handleSaveRow, selectedRowId }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{selectedRowId ? "Edit Row" : "Add New Row"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {fieldConfig.map((field) => (
            <FormControl key={field.key} mt={4}>
              <FormLabel>{field.label}</FormLabel>
              <Input
                type={field.type}
                value={newRow[field.key]}
                onChange={(e) => setNewRow({ ...newRow, [field.key]: e.target.value })}
              />
            </FormControl>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSaveRow}>
            {selectedRowId ? "Update" : "Add"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;