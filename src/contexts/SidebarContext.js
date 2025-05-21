import React, { createContext, useState } from 'react';

// Create context
export const SidebarContext = createContext();

// Create provider component
export const SidebarProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Values to be provided to consumers
  const contextValue = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};