import { Box, useStyleConfig } from "@chakra-ui/react";
import React from "react";

function PanelContent(props) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig("PanelContent", { variant });

  // Add className for targeting with CSS
  return (
    <Box 
      __css={styles} 
      className="panel-content"
      position="relative"
      overflowY="visible"
      {...rest}
    >
      {children}
    </Box>
  );
}

export default PanelContent;