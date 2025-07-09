// Script to generate slugs for existing events
// This should be run after the database migration is applied

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to generate random URL-safe string
function generateRandomSlug(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    if (i > 0 && i % 4 === 0) {
      result += '-';
    }
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Function to generate unique slug
async function generateUniqueSlug() {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const slug = generateRandomSlug(12);
    
    // Check if slug exists
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('url_slug', slug)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No row found, slug is unique
      return slug;
    } else if (error) {
      throw error;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique slug after maximum attempts');
}

// Main function to update all events
async function updateEventSlugs() {
  try {
    console.log('Fetching events without slugs...');
    
    // Get all events that don't have slugs
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('id, title')
      .is('url_slug', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${events.length} events without slugs`);
    
    if (events.length === 0) {
      console.log('All events already have slugs!');
      return;
    }
    
    // Generate slugs for each event
    for (const event of events) {
      console.log(`Generating slug for event ${event.id}: ${event.title}`);
      
      try {
        const slug = await generateUniqueSlug();
        
        // Update the event with the new slug
        const { error: updateError } = await supabase
          .from('events')
          .update({ url_slug: slug })
          .eq('id', event.id);
        
        if (updateError) {
          console.error(`Failed to update event ${event.id}:`, updateError);
          continue;
        }
        
        console.log(`✓ Event ${event.id} updated with slug: ${slug}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Failed to generate slug for event ${event.id}:`, error);
      }
    }
    
    console.log('Slug generation completed!');
    
  } catch (error) {
    console.error('Error updating event slugs:', error);
    process.exit(1);
  }
}

// Run the script
updateEventSlugs();