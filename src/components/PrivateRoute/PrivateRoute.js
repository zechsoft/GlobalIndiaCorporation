import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// PrivateRoute component to protect routes based on authentication and role
const PrivateRoute = ({ component: Component, layout: Layout, role, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      // Check if user is authenticated
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      const userRole = localStorage.getItem("userRole");
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        return (
          <Redirect
            to={{
              pathname: "/auth/signin",
              state: { from: props.location }
            }}
          />
        );
      }
      
      // If role is specified and doesn't match, redirect to appropriate dashboard
      if (role && userRole !== role) {
        const redirectPath = userRole === "admin" ? "/admin/dashboard" : "/client/dashboard";
        return <Redirect to={redirectPath} />;
      }
      
      // If Layout is provided, wrap the Component with Layout
      return Layout ? (
        <Layout {...props}>
          <Component {...props} />
        </Layout>
      ) : (
        <Component {...props} />
      );
    }}
  />
);

export default PrivateRoute;