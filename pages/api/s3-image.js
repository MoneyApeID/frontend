// pages/api/s3-image.js
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || 'ap-southeast-1';
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const S3_ACCESS_KEY = process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY;

// Validate configuration
if (!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
  console.warn('S3 config missing. Check NEXT_PUBLIC_S3_* env vars.');
}

// AWS S3 Client - NO custom endpoint, NO forcePathStyle for native AWS S3
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: S3_ACCESS_KEY && S3_SECRET_KEY ? {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  } : undefined,
  // DO NOT set endpoint for AWS S3
  // DO NOT set forcePathStyle for AWS S3
});

export default async function handler(req, res) {
  const { key } = req.query;
  
  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  // Normalize object key
  let objectKey = String(key);
  
  try {
    objectKey = decodeURIComponent(objectKey);
  } catch (e) {
    // ignore decode errors
  }

  // Remove URL scheme and host if present
  objectKey = objectKey.replace(/^https?:\/\/[^/]+\//i, '');
  
  // Remove query string and fragments
  objectKey = objectKey.split(/[?#]/, 1)[0];
  
  // Trim leading slashes
  objectKey = objectKey.replace(/^\/+/, '');
  
  // Remove bucket name if included in path
  if (objectKey.startsWith(`${S3_BUCKET}/`)) {
    objectKey = objectKey.substring(S3_BUCKET.length + 1);
  }

  // Validate configuration
  const missing = [];
  if (!S3_BUCKET) missing.push('NEXT_PUBLIC_S3_BUCKET');
  if (!S3_ACCESS_KEY) missing.push('NEXT_PUBLIC_S3_ACCESS_KEY_ID');
  if (!S3_SECRET_KEY) missing.push('NEXT_PUBLIC_S3_SECRET_ACCESS_KEY');
  
  if (missing.length) {
    console.error('S3 config missing:', missing.join(', '));
    return res.status(500).json({ 
      error: `S3 configuration missing: ${missing.join(', ')}` 
    });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
    });

    // Generate presigned URL (valid for 60 seconds)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // Optional: Redirect to signed URL
    const redirect = String(req.query.redirect || '').toLowerCase();
    if (redirect === '1' || redirect === 'true') {
      res.setHeader('Location', url);
      return res.status(302).end();
    }

    return res.status(200).json({ url });
  } catch (err) {
    console.error('S3 signed URL error:', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to generate signed URL' 
    });
  }
}
