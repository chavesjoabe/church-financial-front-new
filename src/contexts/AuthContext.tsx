import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { AuthService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    const currentToken = AuthService.getToken();

    if (currentUser && currentToken) {
      setUser({
        ...currentUser,
        isAdmin: currentUser.role === 'ADMIN'
      });
      setToken(currentToken);
    }
    setLoading(false);
  }, []);

  const login = async (document: string, password: string) => {
    try {
      // Step 1: Login and get token
      const receivedToken = await AuthService.login(document, password);

      if (!receivedToken) {
        throw new Error('Credenciais inválidas');
      }

      // Store token in sessionStorage
      sessionStorage.setItem('token', receivedToken);
      setToken(receivedToken);

      // Step 2: Get user details using the token
      const userDetails = await AuthService.getUserByDocument(document, receivedToken);

      // Add isAdmin property based on role
      const userWithAdmin = {
        ...userDetails,
        isAdmin: userDetails.role === 'ADMIN'
      };

      // Store user in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(userWithAdmin));
      setUser(userWithAdmin);
    } catch (error) {
      // Clean up on error
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
