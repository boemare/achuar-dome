import { supabase } from './client';
import { UserRole } from '../../types/auth';

export interface SupabaseUser {
  id: string;
  role: UserRole;
  device_id?: string;
  created_at: string;
}

export async function createOrGetUser(deviceId: string, role: UserRole): Promise<SupabaseUser | null> {
  // Check if user with this device ID exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (existingUser && !fetchError) {
    // Update role if changed
    if (existingUser.role !== role) {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user role:', updateError);
        return existingUser;
      }
      return updatedUser;
    }
    return existingUser;
  }

  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({ device_id: deviceId, role })
    .select()
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    return null;
  }

  return newUser;
}

export async function getUserById(userId: string): Promise<SupabaseUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}
