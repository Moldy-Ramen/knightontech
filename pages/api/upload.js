// pages/api/upload.js

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // let formidable handle the parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ensure upload dir exists
  const uploadDir = path.join(process.cwd(), 'public', '../../img');
  await fs.promises.mkdir(uploadDir, { recursive: true });

  try {
    // formidable v2: call it as a function with options
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
      });

      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Grab the uploaded file (supports single-file field named "file")
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const oldPath = file.filepath || file.path; // v2 uses .filepath
    const fileName = path.basename(oldPath);

    // Return the public URL for your frontend
    return res.status(200).json({ url: `../../img/${fileName}` });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'File upload failed.' });
  }
}
