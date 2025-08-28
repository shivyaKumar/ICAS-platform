"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  role: string | null;
  login: (role: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // NEW
  const router = useRouter();

  // Load role from localStorage on first render
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
    setIsLoading(false); // once checked, stop loading
  }, []);

  const login = (newRole: string) => {
    localStorage.setItem("role", newRole);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem("role");
    setRole(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, isLoading }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
