import { Box, useStyleConfig } from "@chakra-ui/react";
import React from "react";

function MainPanel(props) {
  const { variant, children, ...rest } = props;
  const styles = useStyleConfig("MainPanel", { variant });

  // Add className for targeting with CSS
  return (
    <Box 
      __css={styles} 
      className="main-panel"
      overflowY="auto"
      height="100%"
      {...rest}
    >
      {children}
    </Box>
  );
}

export default MainPanel;