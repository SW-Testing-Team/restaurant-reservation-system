import React, { createContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on refresh
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 200) {
          const data = await res.json();

          // FIXED: backend returns user directly
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
