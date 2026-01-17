import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserRole, AuthContextType, User } from '../types/auth';
import { supabase } from '../services/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Generate a proper UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = useCallback(async (userRole: UserRole) => {
    // Create user in Supabase
    const userId = generateUUID();
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId, role: userRole })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      // Still allow login locally even if DB fails
    }

    const newUser: User = {
      id: data?.id || userId,
      role: userRole,
      createdAt: new Date(data?.created_at || Date.now()),
    };
    setUser(newUser);
    setRole(userRole);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    role,
    login,
    logout,
    isElder: role === 'elder',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
