import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthenticationContext = createContext(null);

export function AuthenticationProvider({ children }) {
  const [userToken, setUserToken] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserToken(decoded);
    }
  }, []);

  function login(token) {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUserToken(decoded);
  }

  function logout() {
    localStorage.removeItem("token");
    setUserToken({});
  }

  function hasAccess(id) {
    return id === userToken.sub;
  }

  const isAuthenticated = Date.now() < userToken.exp * 1000;
  let isAdmin = false;

  if (userToken.scope) {
    isAdmin = userToken.scope.split(" ").includes("admin");
  }

  return (
    <AuthenticationContext.Provider
      value={{
        id: userToken.sub,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        hasAccess,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}

export default AuthenticationProvider;