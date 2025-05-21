import React, { useState, useEffect, useRef } from "react";
import { FaHome, FaUser, FaTable, FaEnvelope, FaSignOutAlt, FaChevronLeft } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "./IconSidebar.css";

const IconSidebar = ({ basePath = "/admin" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  const history = useHistory();

  // Function to handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsDropdownOpen(false);
      }
    };

    // Add click event listener to close sidebar when clicking anywhere
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for route changes to close sidebar
  useEffect(() => {
    const unlisten = history.listen(() => {
      setIsOpen(false);
      setIsDropdownOpen(false);
    });
    
    // Clean up the listener when component unmounts
    return unlisten;
  }, [history]);

  // Navigation handler function
  const navigateTo = (path) => {
    history.push(`${basePath}/${path}`);
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  // Toggle dropdown without navigating
  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent this click from triggering the outside click handler
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <div ref={sidebarRef} className={`icon-sidebar ${isOpen ? "open" : ""}`}>
        <div className="icon-sidebar-icons">
          <button className="icon-sidebar-btn" onClick={() => navigateTo("dashboard")}>
            <FaHome title="Dashboard" />
          </button>
          
          <button className="icon-sidebar-btn" onClick={() => navigateTo("profile")}>
            <FaUser title="Profile" />
          </button>
          
          <div className="icon-sidebar-dropdown">
            <button
              className="icon-sidebar-btn"
              onClick={toggleDropdown}
            >
              <FaTable title="Table" />
            </button>
            
            {isDropdownOpen && (
              <div ref={dropdownRef} className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigateTo("supplier-info")}>
                  Supplier Info
                </button>
                <button className="dropdown-item" onClick={() => navigateTo("customer-order")}>
                  Customer Order
                </button>
                <button className="dropdown-item" onClick={() => navigateTo("material-inquiry")}>
                  Material Inquiry
                </button>
                <button className="dropdown-item" onClick={() => navigateTo("material-replenishment")}>
                  Material Replenishment
                </button>
                <button className="dropdown-item" onClick={() => navigateTo("customer-delivery-notice")}>
                  Customer Delivery
                </button>
              </div>
            )}
          </div>
          
          <button className="icon-sidebar-btn" onClick={() => navigateTo("messages")}>
            <FaEnvelope title="Message" />
          </button>
          
          <button className="icon-sidebar-btn" onClick={() => navigateTo("logout")}>
            <FaSignOutAlt title="Logout" />
          </button>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        ref={toggleBtnRef}
        className="sidebar-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "|" : <FaChevronLeft />}
      </button>
    </>
  );
};

export default IconSidebar;