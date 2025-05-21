import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import ClientLayout from "layouts/Client.js";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme.js";

// Authentication check function
const checkUserAuth = () => {
  // Check sessionStorage first (for session-only login)
  const sessionUser = sessionStorage.getItem("user");
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }
  
  // Check localStorage (for remember me)
  const localUser = localStorage.getItem("user");
  if (localUser) {
    return JSON.parse(localUser);
  }
  
  // No authenticated user found
  return null;
};

// Protected Route component
const ProtectedRoute = ({ component: Component, allowedRole, ...rest }) => {
  const user = checkUserAuth();
  
  return (
    <Route
      {...rest}
      render={(props) => {
        // If user is authenticated and has correct role
        if (user && user.isAuthenticated && user.role === allowedRole) {
          return <Component {...props} />;
        }
        
        // If user is authenticated but wrong role
        if (user && user.isAuthenticated) {
          return <Redirect to={`/${user.role}/dashboard`} />;
        }
        
        // Not authenticated, redirect to login
        return <Redirect to="/auth/signin" />;
      }}
    />
  );
};

const App = () => {
  const user = checkUserAuth();
  
  return (
    <ChakraProvider theme={theme} resetCss={false} position="relative">
      <HashRouter>
        <Switch>
          {/* Auth routes are public */}
          <Route path="/auth" component={AuthLayout} />
          
          {/* Protected routes */}
          <ProtectedRoute path="/admin" component={AdminLayout} allowedRole="admin" />
          <ProtectedRoute path="/client" component={ClientLayout} allowedRole="client" />
          
          {/* Default redirect */}
          {user && user.isAuthenticated ? (
            <Redirect from="/" to={`/${user.role}/dashboard`} />
          ) : (
            <Redirect from="/" to="/auth/signin" />
          )}
        </Switch>
      </HashRouter>
    </ChakraProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

