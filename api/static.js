import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: 'File parameter required' });
  }

  try {
    // Path ke public folder
    const filePath = path.join(__dirname, '../public', file);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Set appropriate content type
    const ext = path.extname(file).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    return res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving static file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}