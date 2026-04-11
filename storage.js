const fs = require('fs');
const path = require('path');
const { S3Client, GetObjectCommand, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

const DATA_DIR = path.join(__dirname, 'data');
const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';

const s3 = BUCKET ? new S3Client({ region: REGION }) : null;

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

async function ensureBucket() {
  if (!s3 || !BUCKET) return;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch (_err) {
    if (REGION === 'us-east-1') {
      await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    } else {
      await s3.send(new CreateBucketCommand({ Bucket: BUCKET, CreateBucketConfiguration: { LocationConstraint: REGION } }));
    }
  }
}

async function readJson(key, seedValue) {
  if (s3 && BUCKET) {
    await ensureBucket();
    try {
      const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const body = await streamToString(out.Body);
      return JSON.parse(body);
    } catch (_err) {
      await writeJson(key, seedValue);
      return seedValue;
    }
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const localPath = path.join(DATA_DIR, key);
  if (!fs.existsSync(localPath)) {
    fs.writeFileSync(localPath, JSON.stringify(seedValue, null, 2));
    return seedValue;
  }
  return JSON.parse(fs.readFileSync(localPath, 'utf8'));
}

async function writeJson(key, value) {
  if (s3 && BUCKET) {
    await ensureBucket();
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: JSON.stringify(value, null, 2),
        ContentType: 'application/json',
      }),
    );
    return;
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const localPath = path.join(DATA_DIR, key);
  fs.writeFileSync(localPath, JSON.stringify(value, null, 2));
}

module.exports = {
  readJson,
  writeJson,
};
