import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for temporary file uploads
const upload = multer({
  dest: 'temp-uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Generate audio from text prompt
router.post('/generate', async (req, res) => {
  try {
    const { prompt, duration = 20, output_format = 'mp3', model = 'stable-audio-2.5' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.STABILITY_API_KEY) {
      return res.status(500).json({ error: 'Stability API key not configured' });
    }

    // Validate output format
    if (!['mp3', 'wav'].includes(output_format)) {
      return res.status(400).json({ error: 'Invalid output format. Must be mp3 or wav.' });
    }

    console.log('Generating audio with prompt:', prompt, 'format:', output_format);

    const payload = {
      prompt,
      output_format,
      duration: parseInt(duration),
      model,
    };

    const response = await axios.postForm(
      'https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio',
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'audio/*',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    if (response.status === 200) {
      // Generate unique filename with correct extension
      const timestamp = Date.now();
      const filename = `audio_${timestamp}.${output_format}`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      
      // Save audio file
      fs.writeFileSync(filepath, Buffer.from(response.data));
      
      // Create companion text file with prompt metadata
      const textFilename = `audio_${timestamp}.txt`;
      const textFilepath = path.join(__dirname, '../../uploads', textFilename);
      const promptData = {
        prompt,
        duration: parseInt(duration),
        output_format,
        model,
        created: new Date().toISOString()
      };
      fs.writeFileSync(textFilepath, JSON.stringify(promptData, null, 2));
      
      console.log('Audio generated successfully:', filename);
      
      res.json({
        success: true,
        filename,
        url: `/api/audio/download/${filename}`,
        prompt,
        duration,
        output_format,
        model
      });
    } else {
      console.error('Stability API error:', response.status, response.data?.toString());
      res.status(response.status).json({
        error: `API Error: ${response.status}`,
        details: response.data?.toString()
      });
    }
  } catch (error) {
    console.error('Error generating audio:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({ error: 'Request timeout - audio generation took too long' });
    } else if (error.response) {
      res.status(error.response.status).json({
        error: `API Error: ${error.response.status}`,
        details: error.response.data?.toString()
      });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Generate audio from audio input (audio-to-audio)
router.post('/generate-a2a', upload.single('audio'), async (req, res) => {
  try {
    const { prompt, duration = 20, output_format = 'mp3', strength = 0.7, model = 'stable-audio-2.5' } = req.body;
    const audioFile = req.file;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (!process.env.STABILITY_API_KEY) {
      return res.status(500).json({ error: 'Stability API key not configured' });
    }

    // Validate output format
    if (!['mp3', 'wav'].includes(output_format)) {
      return res.status(400).json({ error: 'Invalid output format. Must be mp3 or wav.' });
    }

    // Validate strength parameter
    const strengthValue = parseFloat(strength);
    if (isNaN(strengthValue) || strengthValue < 0.01 || strengthValue > 1.0) {
      return res.status(400).json({ error: 'Strength must be between 0.01 and 1.0' });
    }

    console.log('Generating A2A audio with prompt:', prompt, 'format:', output_format, 'strength:', strengthValue);

    try {
      // Prepare FormData for Stability AI API
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('audio', fs.createReadStream(audioFile.path));
      formData.append('output_format', output_format);
      formData.append('duration', parseInt(duration));
      formData.append('strength', strengthValue);
      formData.append('model', model);

      const response = await axios.post(
        'https://api.stability.ai/v2beta/audio/stable-audio-2/audio-to-audio',
        formData,
        {
          validateStatus: undefined,
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
            Accept: 'audio/*',
            ...formData.getHeaders(),
          },
          timeout: 120000, // 2 minute timeout for A2A
        }
      );

      if (response.status === 200) {
        // Generate unique filename with a2a prefix
        const timestamp = Date.now();
        const filename = `a2a_${timestamp}.${output_format}`;
        const filepath = path.join(__dirname, '../../uploads', filename);
        
        // Save audio file
        fs.writeFileSync(filepath, Buffer.from(response.data));
        
        // Create companion text file with metadata
        const textFilename = `a2a_${timestamp}.txt`;
        const textFilepath = path.join(__dirname, '../../uploads', textFilename);
        const metadata = {
          prompt,
          duration: parseInt(duration),
          output_format,
          strength: strengthValue,
          model,
          type: 'audio-to-audio',
          source_filename: audioFile.originalname,
          created: new Date().toISOString()
        };
        fs.writeFileSync(textFilepath, JSON.stringify(metadata, null, 2));
        
        console.log('A2A audio generated successfully:', filename);
        
        res.json({
          success: true,
          filename,
          url: `/api/audio/download/${filename}`,
          prompt,
          duration,
          output_format,
          strength: strengthValue,
          model,
          type: 'audio-to-audio'
        });
      } else {
        console.error('Stability AI A2A API error:', response.status, response.data?.toString());
        res.status(response.status).json({
          error: `API Error: ${response.status}`,
          details: response.data?.toString()
        });
      }
    } finally {
      // Clean up uploaded temporary file
      if (audioFile && audioFile.path && fs.existsSync(audioFile.path)) {
        try {
          fs.unlinkSync(audioFile.path);
          console.log('Cleaned up temporary file:', audioFile.path);
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in A2A generation:', error.message);
    
    // Clean up uploaded file in case of error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file after error:', cleanupError.message);
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({ error: 'Request timeout - audio transformation took too long' });
    } else if (error.response) {
      res.status(error.response.status).json({
        error: `API Error: ${error.response.status}`,
        details: error.response.data?.toString()
      });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Download generated audio file
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../../uploads', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set correct MIME type based on file extension
  const extension = path.extname(filename).toLowerCase();
  const mimeType = extension === '.wav' ? 'audio/wav' : 'audio/mpeg';
  
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filepath);
});

// List generated files (for development)
router.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    return res.json({ files: [] });
  }
  
  const files = fs.readdirSync(uploadsDir)
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    .map(file => {
      const fileInfo = {
        filename: file,
        url: `/audio/download/${file}`,
        created: fs.statSync(path.join(uploadsDir, file)).ctime
      };
      
      // Try to read companion text file for prompt data
      const baseName = path.parse(file).name; // e.g., "audio_1756518278127" or "a2a_1756518278127"
      const textFilePath = path.join(uploadsDir, `${baseName}.txt`);
      
      if (fs.existsSync(textFilePath)) {
        try {
          const promptData = JSON.parse(fs.readFileSync(textFilePath, 'utf8'));
          fileInfo.prompt = promptData.prompt;
          fileInfo.duration = promptData.duration;
          fileInfo.output_format = promptData.output_format;
          fileInfo.model = promptData.model;
          
          // Add audio-to-audio specific metadata
          if (promptData.type === 'audio-to-audio') {
            fileInfo.type = 'audio-to-audio';
            fileInfo.strength = promptData.strength;
            fileInfo.source_filename = promptData.source_filename;
          } else {
            fileInfo.type = 'text-to-audio';
          }
        } catch (err) {
          console.error('Error reading prompt file:', textFilePath, err.message);
        }
      } else {
        // Fallback: determine type from filename prefix
        fileInfo.type = file.startsWith('a2a_') ? 'audio-to-audio' : 'text-to-audio';
      }
      
      return fileInfo;
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));
    
  res.json({ files });
});

export { router as audioRoutes };
