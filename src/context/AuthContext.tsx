import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
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
  // Start authenticated as general user by default
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>('general');
  const [initialized, setInitialized] = useState(false);

  // Create the default general user on app start
  useEffect(() => {
    if (!initialized) {
      const initUser = async () => {
        const userId = generateUUID();

        // Try to create user in database
        const { data, error } = await supabase
          .from('users')
          .insert({ id: userId, role: 'general' })
          .select()
          .single();

        if (error) {
          console.log('Error creating default user, retrying...', error);
          // Retry once with a new UUID
          const retryId = generateUUID();
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .insert({ id: retryId, role: 'general' })
            .select()
            .single();

          if (retryError) {
            console.log('Retry failed, using local user:', retryError);
          }

          setUser({
            id: retryData?.id || retryId,
            role: 'general',
            createdAt: new Date(retryData?.created_at || Date.now()),
          });
        } else {
          setUser({
            id: data.id,
            role: 'general',
            createdAt: new Date(data.created_at),
          });
        }

        setInitialized(true);
      };
      initUser();
    }
  }, [initialized]);

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
    isReady: initialized && user !== null,
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
