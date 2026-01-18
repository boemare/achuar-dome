const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xvasxijhtpavtnyxzsgr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Hi7y3g-BzL29ZK0eq8GNzg_KpaNM8Qp';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupBuckets() {
  try {
    console.log('Setting up Supabase buckets...');

    // Create 'media' bucket
    console.log('Creating media bucket...');
    const { data: mediaBucket, error: mediaError } = await supabase.storage.createBucket('media', {
      public: true,
    });

    if (mediaError && !mediaError.message.includes('already exists')) {
      console.error('Error creating media bucket:', mediaError);
    } else {
      console.log('✓ Media bucket ready');
    }

    // Create 'voicerecordings' bucket
    console.log('Creating voicerecordings bucket...');
    const { data: voiceBucket, error: voiceError } = await supabase.storage.createBucket('voicerecordings', {
      public: true,
    });

    if (voiceError && !voiceError.message.includes('already exists')) {
      console.error('Error creating voicerecordings bucket:', voiceError);
    } else {
      console.log('✓ Voice recordings bucket ready');
    }

    console.log('\n✓ Supabase buckets are set up!');
    console.log('You can now upload files and use the app.');
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setupBuckets();
