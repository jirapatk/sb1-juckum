import { createClient } from '@supabase/supabase-js';
import type { Note, Group } from './types';

const supabaseUrl = 'https://dxjqpoynkdbmruhxmcor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4anFwb3lua2RibXJ1aHhtY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMzkxNDAsImV4cCI6MjA0NzkxNTE0MH0.jDRQ_mOXAvlh3gGzz5AyCG37-2SzO-JwuiuAnFcgQpU';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('notes-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('notes-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function syncNotes(notes: Note[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notes')
    .upsert(
      notes.map(note => ({
        id: note.id,
        user_id: user.id,
        group_id: note.groupId,
        title: note.title,
        content: note.content,
        type: note.type,
        todos: note.todos,
        created_at: note.createdAt,
        updated_at: note.updatedAt
      }))
    );

  if (error) console.error('Error syncing notes:', error);
}

export async function fetchNotes(): Promise<Note[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    type: note.type,
    groupId: note.group_id,
    todos: note.todos || [],
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
    showTasks: false
  }));
}

export async function deleteGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // First update all notes in this group to have no group
  const { error: updateError } = await supabase
    .from('notes')
    .update({ group_id: null })
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Error updating notes:', updateError);
    return;
  }

  // Then delete the group
  const { error: deleteError } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Error deleting group:', deleteError);
    return;
  }
}

export async function syncGroups(groups: Group[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('groups')
    .upsert(
      groups.map(group => ({
        id: group.id,
        user_id: user.id,
        name: group.name,
        color: group.color,
        created_at: group.createdAt
      }))
    );

  if (error) console.error('Error syncing groups:', error);
}

export async function fetchGroups(): Promise<Group[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }

  return data.map(group => ({
    id: group.id,
    name: group.name,
    color: group.color,
    createdAt: new Date(group.created_at)
  }));
}