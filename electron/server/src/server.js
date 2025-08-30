import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { audioRoutes } from './routes/audio.js';
import fs from 'fs';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Determine if we're in Electron environment
const isElectron = process.env.ELECTRON_APP === 'true';

// Create uploads directory if it doesn't exist
const uploadsDir = isElectron 
  ? path.join(__dirname, '../../../../server/uploads')  // Share with original server
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create temp-uploads directory if it doesn't exist
const tempUploadsDir = isElectron 
  ? path.join(__dirname, '../../../../server/temp-uploads')  // Share with original server
  : path.join(__dirname, '../temp-uploads');

if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/audio', audioRoutes);

// Serve static files from client build
let distPath;
if (isElectron) {
  // In Electron, serve from the dist folder in the app directory
  distPath = path.join(__dirname, '../../../dist');
} else {
  // Fallback for development
  distPath = path.join(__dirname, '../../../client/dist');
}

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Catch all handler for client-side routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Frontend not found' });
      }
    } else if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  // If no dist folder, show API info
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Stability Audio 2.5 Desktop Server',
      status: 'running',
      environment: isElectron ? 'electron' : 'standalone',
      endpoints: {
        health: '/api/health',
        audio: '/api/audio/*'
      },
      note: 'Frontend not built. Run build process first.'
    });
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    environment: isElectron ? 'electron' : 'standalone',
    uploadsDir,
    tempUploadsDir,
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SA25 Desktop Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`📁 Temp uploads directory: ${tempUploadsDir}`);
  console.log(`⚡ Environment: ${isElectron ? 'Electron' : 'Standalone'}`);
});
