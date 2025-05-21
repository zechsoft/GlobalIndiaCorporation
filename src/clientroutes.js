import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import SupplierInfo from "views/Dashboard/SupplierInfo.js";
import CustomerOrder from "views/Dashboard/CustomerOrder.js";
import Profile from "views/Dashboard/Profile.js";
import Messages from 'views/Dashboard/Messages';

import CustomTableDisplay from 'views/Dashboard/CustomTableDisplay';
import ReadOnlyTableDisplay from 'views/Dashboard/ReadOnlyTableDisplay';  
import SignIn from "views/Pages/SignIn.js";
import ForgotPassword from "views/Pages/ForgotPassword.js";
import SignUp from "views/Pages/SignUp.js";
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

var clientRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: "/client",
    sidebar: true, // Show in sidebar
  },
  {
    path: "/profile",
    name: "Profile",
    icon: <PersonIcon color='inherit' />,
    
    component: Profile,
    layout: "/client",
    sidebar: true, // Show in sidebar
  },
  {
    path: "/signin",
    name: "Sign In",
    icon: <DocumentIcon color='inherit' />,
    component: SignIn,
    layout: "/auth",
    sidebar: false, // Hide from sidebar
  },
  {
    path: "/signup",
    name: "Sign Up",
    icon: <DocumentIcon color='inherit' />,
    component: SignUp,
    layout: "/auth",
    sidebar: false, // Hide from sidebar
  },
  {
    path: "/daily-work-report",
    name: "Daily Work",
    icon: <StatsIcon color='inherit' />,
    component: DailyWorkReport,
    state: "pageCollapse",
    layout: "/client",
    sidebar: true, // Show in sidebar
  },
  {
    path: "/tables",
    name: "View Tables",
    icon: <StatsIcon color='inherit' />,
    component: Tables,
    state: "pageCollapse",
    layout: "/client",
    sidebar: true, // Show in sidebar
  },
   {
      path: "/CustomTableDisplay",
      name: "customised Table ",
      rtlName: "لوحة القيادة",
      icon: <StatsIcon color='inherit' />,
      component: CustomTableDisplay,
      layout: "/client",
      sidebar: true,
    },
     {
      path: "/ReadOnlyTableDisplay",
      name: "ReadOnlyTable",
      rtlName: "لوحة القيادة",
      icon: <StatsIcon color='inherit' />,
      component: ReadOnlyTableDisplay,
      layout: "/client",
      sidebar: false,
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
    name: "Tables",
    category: "account",
    state: "pageCollapse",
    secondaryNavbar: true,
    layout: "/client",
    sidebar: true, // Show in sidebar
    views: [
      {
        path: "/supplier-info",
        name: "Supplier Info",
        icon: <StatsIcon color='inherit' />,
        
        component: SupplierInfo,
        layout: "/client",
        sidebar: true, // Show in sidebar
      },
      {
        path: "/customer-order",
        name: "Customer Order",
        icon: <StatsIcon color='inherit' />,
        
        component: CustomerOrder,
        layout: "/client",
        sidebar: true, // Show in sidebar
      },
      {
        path: "/material-inquiry",
        name: "Material Inquiry",
        icon: <StatsIcon color='inherit' />,
        
        component: MaterialInquiry,
        layout: "/client",
        sidebar: true, // Show in sidebar
      },
      {
        path: "/material-replenishment",
        name: "Material Replenish",
        icon: <StatsIcon color='inherit' />,
        
        component: MaterialReplenishment,
        layout: "/client",
        sidebar: true, // Show in sidebar
      },
      {
        path: "/customer-delivery-notice",
        name: "Customer Delivery",
        icon: <StatsIcon color='inherit' />,
        
        component: CustomerDeliveryNotice,
        layout: "/client",
        sidebar: true, // Show in sidebar
      },
    ],
  },
];

export default clientRoutes;