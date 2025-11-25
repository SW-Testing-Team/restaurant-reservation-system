import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;
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
  }, [API_URL]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
