// Clear all authentication-related localStorage and sessionStorage
if (typeof window !== 'undefined') {
  // Clear all localStorage
  localStorage.clear();
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Clear any Supabase-specific items
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('Cleared all auth storage');
}
