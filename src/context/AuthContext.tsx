import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Role = 'OWNER' | 'AGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
}

interface AuthContextValue {
  user: User | null;
  company: Company | null;
  companyId: string | null;
  isLoading: boolean;
  login: (user: User, company: Company, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Restore auth on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');

    if (token && storedUser && storedCompany) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User, companyData: Company, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('company', JSON.stringify(companyData));

    setUser(userData);
    setCompany(companyData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        companyId: company?.id ?? null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
