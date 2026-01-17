/**
 * Seed script to download camera trap images from LILA dataset and upload to Supabase
 * Run with: node scripts/seed-camera-trap-images.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://akuimlfoqkmswrrqiqjk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_THrAafUFMgDxtjIKU6GpJQ_PKkHvFra';
const STORAGE_BUCKET = 'media';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Camera trap image URLs from LILA WCS dataset (Wildlife Conservation Society)
// These are real wildlife camera trap images under CDLA Permissive license
const CAMERA_TRAP_IMAGES = [
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0011/0009.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0011/0010.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0011/0011.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0011/0012.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0011/0013.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0012/0001.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0012/0002.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0012/0003.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0013/0001.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0013/0002.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0014/0001.jpg',
    species: 'Wildlife',
  },
  {
    url: 'https://storage.googleapis.com/public-datasets-lila/wcs-unzipped/animals/0014/0002.jpg',
    species: 'Wildlife',
  },
];

async function downloadImage(url) {
  console.log(`  Downloading: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function uploadToSupabase(imageData, filename) {
  const path = `photos/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, imageData, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  return path;
}

async function createPhotoRecord(storagePath) {
  const { data, error } = await supabase
    .from('photos')
    .insert({
      storage_path: storagePath,
      user_id: null,
      observation_id: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }

  return data;
}

async function seedImages() {
  console.log('Starting camera trap image seeding...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < CAMERA_TRAP_IMAGES.length; i++) {
    const image = CAMERA_TRAP_IMAGES[i];
    const filename = `camera_trap_${Date.now()}_${i}.jpg`;

    console.log(`[${i + 1}/${CAMERA_TRAP_IMAGES.length}] Processing image...`);

    try {
      // Download image
      const imageData = await downloadImage(image.url);
      console.log(`  Downloaded ${imageData.length} bytes`);

      // Upload to Supabase storage
      const storagePath = await uploadToSupabase(imageData, filename);
      console.log(`  Uploaded to: ${storagePath}`);

      // Create database record
      const record = await createPhotoRecord(storagePath);
      console.log(`  Created record: ${record.id}`);

      successCount++;
      console.log('  Success!\n');

      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  Error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('='.repeat(50));
  console.log(`Seeding complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
}

// Run the seeding
seedImages().catch(console.error);
