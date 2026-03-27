import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userId: string, email: string, password: string, userNm: string) => Promise<void>;
  signIn: (userId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const currentUser = await apiClient.getCurrentUser();

        if (isMounted) {
          if (currentUser) {
            // Session valid — sync localStorage with fresh server data
            localStorage.setItem('user', JSON.stringify(currentUser));
            setUser(currentUser);
          } else {
            // No valid session — clear any stale localStorage
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem('user');  // ← clear stale data on error too
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };


    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = async (userId: string, email: string, password: string, userNm: string) => {
    setError(null);
    try {
      await apiClient.signup(userId, email, password, userNm);
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const signIn = async (userId: string, password: string) => {
    setError(null);
    try {
      const signedInUser = await apiClient.login(userId, password);
      localStorage.setItem('user', JSON.stringify(signedInUser));
      setUser(signedInUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await apiClient.logout();
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
