import { supabase } from './supabase.js';

export async function getRandomGreeting() {
  const { data, error } = await supabase
    .from('greetings')
    .select('message');

  if (error) {
    console.error('Error fetching greetings:', error);
    return 'Hello there!';
  }

  if (!data || data.length === 0) {
    return 'Hello there!';
  }

  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex].message;
}
