export type UserRole = 'elder' | 'general';

export interface User {
  id: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
}

export interface AuthContextType extends AuthState {
  login: (role: UserRole) => void;
  logout: () => void;
  isElder: boolean;
}
