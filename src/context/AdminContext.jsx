import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { verifyAdmin } from "../api";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      verifyAdmin().then((valid) => {
        setIsAdmin(valid);
        if (!valid) localStorage.removeItem("adminToken");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem("adminToken", token);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
