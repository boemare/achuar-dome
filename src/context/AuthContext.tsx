import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, AuthContextType, User } from '../types/auth';
import { supabase } from '../services/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const DEVICE_USER_ID_KEY = 'achuar_device_user_id';

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

  // Restore or create device-scoped user on app start
  useEffect(() => {
    if (!initialized) {
      const initUser = async () => {
        // Check for a previously persisted user ID on this device
        const storedUserId = await AsyncStorage.getItem(DEVICE_USER_ID_KEY);

        if (storedUserId) {
          // Try to fetch the existing user from Supabase
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, role, created_at')
            .eq('id', storedUserId)
            .single();

          if (existingUser) {
            setUser({
              id: existingUser.id,
              role: existingUser.role as UserRole,
              createdAt: new Date(existingUser.created_at),
            });
            setRole(existingUser.role as UserRole);
            setInitialized(true);
            return;
          }
        }

        // No stored ID or user was deleted — create a new one
        const userId = generateUUID();

        const { data, error } = await supabase
          .from('users')
          .insert({ id: userId, role: 'general', device_id: userId })
          .select()
          .single();

        const finalId = data?.id || userId;
        await AsyncStorage.setItem(DEVICE_USER_ID_KEY, finalId);

        if (error) {
          console.log('Error creating default user:', error);
        }

        setUser({
          id: finalId,
          role: 'general',
          createdAt: new Date(data?.created_at || Date.now()),
        });

        setInitialized(true);
      };
      initUser();
    }
  }, [initialized]);

  const login = useCallback(async (userRole: UserRole) => {
    // If upgrading current user to elder, update in place
    if (user && userRole === 'elder') {
      await supabase
        .from('users')
        .update({ role: 'elder' })
        .eq('id', user.id);

      setUser({ ...user, role: 'elder' });
      setRole('elder');
      return;
    }

    // Otherwise create a new user
    const userId = generateUUID();
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId, role: userRole, device_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
    }

    const finalId = data?.id || userId;
    await AsyncStorage.setItem(DEVICE_USER_ID_KEY, finalId);

    const newUser: User = {
      id: finalId,
      role: userRole,
      createdAt: new Date(data?.created_at || Date.now()),
    };
    setUser(newUser);
    setRole(userRole);
    setIsAuthenticated(true);
  }, [user]);

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
