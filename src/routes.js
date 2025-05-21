import React, { Component } from 'react';
import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import SupplierInfo from "views/Dashboard/SupplierInfo.js";
import Messages from 'views/Dashboard/Messages';
import ResetPassword from 'views/Pages/ResetPassword';
import CustomerOrder from "views/Dashboard/CustomerOrder.js";
import Profile from "views/Dashboard/Profile.js";
import ForgotPassword from "views/Pages/ForgotPassword.js";
import SignIn from "views/Pages/SignIn.js";
import CustomTableDisplay from 'views/Dashboard/CustomTableDisplay';
import ReadOnlyTableDisplay from 'views/Dashboard/ReadOnlyTableDisplay';
import TableCustomizer from 'views/Dashboard/TableCustomizer';
import SignUp from "views/Pages/SignUp.js"; // Import Sign Up component
import MaterialReplenishment from "views/Dashboard/MaterialReplenishment.js"; 
import MaterialInquiry from "views/Dashboard/MaterialInquiry.js";
import CustomerDeliveryNotice from "views/Dashboard/CustomerDeliveryNotice.js";
import DailyWorkReport from "views/Dashboard/DailyWorkReport.js";

import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
  SupportIcon,
} from "components/Icons/Icons";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: "/admin",
    sidebar: true,
  },
  {
    path: "/profile",
    name: "Profile",
    rtlName: "لوحة القيادة",
    icon: <PersonIcon color='inherit' />,
   
    component: Profile,
    layout: "/admin",
    sidebar: true,
  },
  
  {
    path: "/CustomTableDisplay",
    name: "customised Table ",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color='inherit' />,
    component: CustomTableDisplay,
    layout: "/admin",
    sidebar: true,
  },
   {
    path: "/ReadOnlyTableDisplay",
    name: "ReadOnlyTable",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color='inherit' />,
    component: ReadOnlyTableDisplay,
    layout: "/admin",
    sidebar: false,
  },
  {
    path: "/TableCustomizer",
    name: "Table Creation ",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color='inherit' />,
    component: TableCustomizer,
    layout: "/admin",
    sidebar: true,
  },
  {
    path: "/forgot-password",
    name: "Forgot Password",
    icon: <DocumentIcon color='inherit' />,
    component: ForgotPassword,
    layout: "/auth",
    sidebar: false, // Hide from sidebar
  },
  {
    path: "/ResetPassword",
    name: "ResetPassword",
    icon: <DocumentIcon color='inherit' />,
    component: ResetPassword,
    layout: "/auth",
    sidebar: false, // Hide from sidebar
  },
  
  {
    name: "Tables",
    category: "account",
    rtlName: "صفحات",
    state: "pageCollapse",
    hasSecondaryNavbar: true,
    views: [
      {
        path: "/supplier-info",
        name: "Supplier Info",
        rtlName: "لوحة القيادة",
        icon: <StatsIcon color='inherit' />,
       
        component: SupplierInfo,
        layout: "/admin",
        sidebar: true,
      },
      {
        path: "/customer-order",
        name: "Customer Order",
        rtlName: "لوحة القيادة",
        icon: <StatsIcon color='inherit' />,
      
        component: CustomerOrder,
        layout: "/admin",
        sidebar: true,
      },
      {
        path: "/material-inquiry",
        name: "Material Inquiry",
        rtlName: "لوحة القيادة",
        icon: <StatsIcon color='inherit' />,
        
        component: MaterialInquiry,
        layout: "/admin",
        sidebar: true,
      },
      {
        path: "/material-replenishment",
        name: "Material Replenish",
        rtlName: "لوحة القيادة",
        icon: <StatsIcon color='inherit' />,
        
        component: MaterialReplenishment,
        layout: "/admin",
        sidebar: true,
      },
      {
        path: "/customer-delivery-notice",
        name: "Customer Delivery",
        rtlName: "لوحة القيادة",
        icon: <StatsIcon color='inherit' />,
        
        component: CustomerDeliveryNotice,
        layout: "/admin",
        sidebar: true,
      },
    ],
  },
  {
    path: "/daily-work-report",
    name: "Daily Work",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color='inherit' />,
    component: DailyWorkReport,
    state: "pageCollapse",
    layout: "/admin",
    sidebar: true,
  },
  {
    path: "/tables",
    name: "View Tables",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color='inherit' />,
    component: Tables,
    state: "pageCollapse",
    layout: "/admin",
    sidebar: true,
  },
  {
    path: "/signin",
    name: "Sign In",
    rtlName: "لوحة القيادة",
    icon: <DocumentIcon color='inherit' />,
    component: SignIn,
    layout: "/auth",
    sidebar: false,
  },
  {
    path: "/signup",
    name: "Sign Up",
    rtlName: "لوحة القيادة",
    icon: <DocumentIcon color='inherit' />,
    component: SignUp,
    layout: "/auth",
    sidebar: false,
  },
];

export default dashRoutes;
