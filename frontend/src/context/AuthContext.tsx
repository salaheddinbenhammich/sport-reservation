import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";


//====== Interfaces========
interface User {
  _id: string;
  avatar?: string;
  username: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}


interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  birthDate?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// ======Context setup===========
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};


// ========Provider==========
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // ✅ Start with true

  // ==========Auto-login on refresh==========
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchUserProfile(storedToken);
      } else {
        setLoading(false); // No token, stop loading
      }
    };

    initAuth();
  }, []); 

  // =========Fetch user profile========
  const fetchUserProfile = async (jwt: string) => {
    try {
      const res = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      const data = res.data._doc ? res.data._doc : res.data;

      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isActive: data.isActive,
        avatar: data.avatar,
      });
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };


  // =============Login=============
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      const { access_token } = res.data; // only get the token
      localStorage.setItem("token", access_token);
      setToken(access_token);

      // now fetch the user profile with the token
      await fetchUserProfile(access_token);

      return true;

    } catch (error) {

      return false;

    } finally {
      setLoading(false);
    }
  };

  // =============Register==========
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      await api.post("/auth/register", data);
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };


  // =============Logout==========
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // ===========Context Value============
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};