# Stability Audio 2 - Web & Desktop Application

A comprehensive application for generating and transforming high-quality audio using Stability AI's Stable Audio 2.5 model. Available as both a **desktop application** (recommended for end users) and a **web application** (ideal for development and server deployments).

## 🚀 Quick Start - Choose Your Version

### Option A: Desktop Application (Recommended)
**Easy installation, no setup required!**

1. **Download** the installer: `SA25-desktop/build/Stability Audio 2.5 Setup 1.0.0.exe`
2. **Run** the installer and follow the setup wizard
3. **Launch** the application from your desktop or start menu
4. **Add your API key** when prompted on first launch

✅ **Benefits**: Native OS integration, no port conflicts, automatic file management, offline capable

### Option B: Web Application (Developers/Servers)
**For development, customization, or server deployments**

1. [Follow the detailed web setup instructions below](#web-application-setup)

## 📋 System Requirements

### Desktop Application
- **Windows**: Windows 10 or newer (64-bit)
- **macOS**: macOS 10.14 or newer (Intel/Apple Silicon)
- **Linux**: Ubuntu 18.04+ or equivalent (64-bit)
- **Storage**: ~200MB for application + space for generated audio files
- **Internet**: Required for audio generation (Stability AI API calls)

### Web Application
- **Node.js**: v16 or higher
- **NPM**: Latest version
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Ports**: 3000 (development) and 5000 (production) available

## 🎵 Features

### Text-to-Audio Generation (T2A)
- Generate audio from text prompts
- Adjustable duration (1-120 seconds)
- Multiple output formats (MP3, WAV)
- High-quality audio synthesis

### Audio-to-Audio Transformation (A2A)
- Transform existing audio files using text prompts
- Upload audio files (MP3/WAV, 6-190 seconds, max 50MB)
- Adjustable transformation strength (0.01-1.0)
- Song-to-song transformations and audio style transfer
- Preserve or completely transform original audio characteristics

### Audio Inpainting
- Replace specific time segments of existing audio files
- Precise time range selection with mask start/end controls
- Advanced parameters for fine control (seed, sampling steps)
- Selective content replacement while preserving surrounding audio
- Support for creative audio editing and restoration workflows

### Unified Gallery & Management
- Tabbed interface for easy switching between T2A, A2A, and Audio Inpainting
- Audio gallery with playback controls for all generation types
- Type badges (T2A/A2A/INP) to distinguish generation methods
- Enhanced metadata display including transformation and inpainting details
- Local file storage with intelligent naming (audio_, a2a_, and inpaint_ prefixes)
- **Desktop**: Native download dialogs with file location selection
- **Web**: Browser-based download functionality
- Optimized production build

## 🖥️ Desktop Application

### Installation & Usage
1. **Download** the installer from the `SA25-desktop/build/` directory
2. **Run** the installer (`Stability Audio 2.5 Setup 1.0.0.exe`)
3. **Follow** the installation wizard
4. **Launch** the app from desktop shortcut or start menu
5. **Configure** your Stability AI API key on first launch

### Desktop-Specific Features
- **Native OS Integration**: System file dialogs for downloads
- **Offline Interface**: No browser or server setup required
- **Automatic Updates**: Built-in update mechanism (future releases)
- **System Tray**: Minimize to system tray for background operation
- **File Association**: Associate audio project files (future feature)
- **Cross-Platform**: Windows, macOS, and Linux support

### Desktop Development
If you want to build the desktop app from source:

```bash
# Navigate to desktop app directory
cd SA25-desktop

# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for distribution
npm run build

# Built installer will be in: build/Stability Audio 2.5 Setup 1.0.0.exe
```

### Desktop Project Structure
```
SA25-desktop/
├── electron/                 # Electron main process files
│   ├── main.js              # Main application logic
│   ├── preload.js           # Secure IPC bridge
│   └── server/              # Embedded Express server
├── build/                   # Built installers and packages
│   ├── Stability Audio 2.5 Setup 1.0.0.exe  # Windows installer
│   └── win-unpacked/        # Unpacked application files
├── dist/                    # React frontend (copied from ../client/dist)
├── scripts/                 # Build and utility scripts
└── package.json             # Electron app configuration
```

## 🌐 Web Application Setup

### Prerequisites
- Node.js (v16 or higher)
- NPM
- Stability AI API key

### Installation

#### 1. Install Dependencies
```bash
npm run install:all
```

#### 2. Configure API Key
1. Copy the `.env` file in the root directory
2. Add your Stability AI API key:
```
STABILITY_API_KEY=your_api_key_here
```

#### 3. Development Mode (Optional)
To run in development mode with hot reload:
```bash
npm run dev
```
This starts both the client (http://localhost:3000) and server (http://localhost:5000).

#### 4. Production Mode
For the optimized production version:

**Build the application:**
```bash
npm run build:full
```

**Start the production server:**
```bash
npm start
```

**Or build and start in one command:**
```bash
npm run start:prod
```

The application will be available at: **http://localhost:5000**

Note: Make sure port 5000 is not being used by other applications when starting the production server.

### Web Production Features
- Optimized and minified client code
- Single server serving both API and frontend
- Smaller bundle sizes with tree shaking
- Production-ready static asset serving

### Web Project Structure
```
stableaudio2-ui/
├── client/                 # React frontend
│   ├── dist/              # Built production files
│   └── src/               # Source code
├── server/                # Express backend
│   ├── src/               # Server source code
│   └── uploads/           # Generated audio files
├── SA25-desktop/          # Desktop application
│   └── ...               # (See desktop structure above)
├── .env                   # Environment variables
└── package.json           # Main project configuration
```

## 🆚 Web vs Desktop Comparison

| Feature | Desktop App | Web App |
|---------|-------------|---------|
| **Installation** | One-click installer | Manual setup required |
| **API Key Setup** | GUI prompt on first launch | Manual .env file editing |
| **File Downloads** | Native save dialogs | Browser downloads folder |
| **Port Conflicts** | None (self-contained) | Requires available ports |
| **Updates** | Automatic (future) | Manual git pull/rebuild |
| **Offline Interface** | ✅ Yes | ❌ Requires server running |
| **Cross-Platform** | Windows/Mac/Linux | Any OS with Node.js |
| **Development** | Limited customization | Full source access |
| **Server Deployment** | Not applicable | ✅ Easy deployment |
| **Resource Usage** | ~200MB installed | Depends on Node.js setup |

## 📝 Usage Guide

The application features a tabbed interface with three main modes:

### Text-to-Audio Generation
1. Select the **"Text to Audio"** tab
2. Enter a detailed text description of the audio you want to generate
   - Example: "A cheerful acoustic guitar melody with soft drums"
3. Set the desired duration (1-120 seconds)
4. Choose output format (MP3 or WAV)
5. Click "Generate Audio"
6. View and play generated files in the gallery below

### Audio-to-Audio Transformation
1. Select the **"Audio to Audio"** tab
2. **Upload an audio file**:
   - Click the upload area or drag and drop your file
   - Supported formats: MP3, WAV
   - File requirements: 6-190 seconds duration, max 50MB
3. **Enter a transformation description**:
   - Example: "Make it sound more upbeat with electronic elements"
4. **Adjust transformation strength** (0.01-1.0):
   - Lower values (0.01-0.3): Subtle changes, preserves original character
   - Medium values (0.4-0.7): Moderate transformation
   - Higher values (0.8-1.0): Complete transformation
5. Set the desired output duration (1-190 seconds)
6. Choose output format (MP3 or WAV)
7. Click "Transform Audio"
8. View and play transformed files in the gallery below

### Audio Inpainting
1. Select the **"Audio Inpainting"** tab
2. **Upload an audio file**:
   - Click the upload area or drag and drop your file
   - Supported formats: MP3, WAV
   - File requirements: 6-190 seconds duration, max 50MB
3. **Enter an inpainting description**:
   - Example: "A solo violin melody" or "Ambient nature sounds"
   - Describe what you want to replace in the selected time range
4. **Set the inpainting time range**:
   - **Start Time**: Beginning of the segment to replace (0-190 seconds)
   - **End Time**: End of the segment to replace (0-190 seconds)
   - Start time must be less than end time
5. **Configure advanced parameters** (optional):
   - **Seed**: Controls randomness (0 = random, 1-4294967294 for reproducible results)
   - **Steps**: Sampling steps (4-8, higher = better quality but slower)
6. Set the desired output duration (1-190 seconds)
7. Choose output format (MP3 or WAV)
8. Click "Inpaint Audio"
9. View and play inpainted files in the gallery below

### Gallery Features
- **Type Badges**: T2A (Text-to-Audio), A2A (Audio-to-Audio), and INP (Audio Inpainting) labels
- **Metadata Display**: Shows prompts, transformation details, duration, and format
- **Audio Playback**: Click play/pause buttons to preview audio
- **Download**: 
  - **Desktop**: Native save dialog with file location selection
  - **Web**: Download to browser's default download folder
- **Source Information**: For A2A and INP files, shows original filename and generation parameters

## 📁 Generated Files

All generated audio files are stored locally with intelligent naming:

### File Storage Locations
- **Desktop App**: User-selectable location via native save dialogs
- **Web App**: `server/uploads/` directory + browser downloads

### File Naming Convention
- **Text-to-Audio**: `audio_[timestamp].[format]` (e.g., `audio_1756521412164.mp3`)
- **Audio-to-Audio**: `a2a_[timestamp].[format]` (e.g., `a2a_1756557198932.mp3`)
- **Audio Inpainting**: `inpaint_[timestamp].[format]` (e.g., `inpaint_1756567794449.mp3`)
- **Metadata**: Each audio file has a companion `.txt` file with generation details

### File Management
Generated files can be:
- Played directly in the application through the gallery
- Downloaded to your computer via download buttons
- Managed and organized through the gallery interface
- Identified by type through filename prefixes and gallery badges

## 🔗 API Endpoints

The application provides the following REST API endpoints:

### Text-to-Audio Generation
- **POST** `/api/audio/generate`
- **Body**: `{ prompt, duration, output_format, model }`

### Audio-to-Audio Transformation
- **POST** `/api/audio/generate-a2a`
- **Content-Type**: `multipart/form-data`
- **Fields**: `prompt, audio (file), duration, output_format, strength, model`

### Audio Inpainting
- **POST** `/api/audio/generate-inpaint`
- **Content-Type**: `multipart/form-data`
- **Fields**: `prompt, audio (file), duration, output_format, mask_start, mask_end, seed, steps, model`

### File Management
- **GET** `/api/audio/files` - List all generated files with metadata
- **GET** `/api/audio/download/[filename]` - Download specific file

## 🛠️ Development Scripts

### Web Application
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build client for production
- `npm run build:full` - Build and show completion message
- `npm start` - Start production server
- `npm run start:prod` - Build and start production in one command
- `npm run install:all` - Install dependencies for all packages

### Desktop Application
- `cd SA25-desktop && npm run dev` - Start desktop app in development mode
- `cd SA25-desktop && npm run build` - Build desktop installer
- `cd SA25-desktop && node scripts/copy-dist.js` - Copy web build to desktop app

## 🐛 Troubleshooting

### Desktop Application Issues

#### Installation Problems
- **Installer won't run**: Right-click → "Run as administrator" (Windows) or check system security settings
- **Antivirus warnings**: The app may be flagged as "unknown software" - this is normal for new installers
- **Installation fails**: Ensure you have administrator privileges and sufficient disk space (~200MB)

#### Runtime Issues
- **App won't start**: Check Windows Event Viewer for detailed error messages
- **API key errors**: The app will prompt for API key on first launch - ensure it's valid
- **Audio generation fails**: Verify internet connection and API key validity
- **File save errors**: Ensure the selected download location has write permissions

#### Performance Issues
- **Slow generation**: This is normal - audio generation is compute-intensive on Stability AI servers
- **High memory usage**: The app includes a full Chromium engine - this is expected for Electron apps
- **Slow startup**: First launch may be slower as the app initializes

### Web Application Issues

#### General Issues
- **Port 5000 in use**: The server uses port 5000 by default. Make sure no other applications are using this port.
- **API Key Issues**: Ensure your Stability AI API key is correctly set in the `.env` file.
- **Missing Dependencies**: Run `npm run install:all` to ensure all dependencies are installed.

#### Audio-to-Audio Specific Issues
- **File Upload Errors**: Ensure your audio file is MP3 or WAV format, between 6-190 seconds, and under 50MB.
- **Unsupported Audio**: Only MP3 and WAV files are supported. Convert other formats before uploading.
- **Duration Validation**: Audio files must be at least 6 seconds and no longer than 190 seconds.
- **Playback Issues**: If A2A files won't play, ensure both frontend and backend servers are running.
- **Transformation Quality**: Adjust the strength parameter - lower values preserve more original characteristics.

#### Audio Inpainting Specific Issues
- **Time Range Validation**: Ensure start time is less than end time and both are within the audio file duration.
- **Mask Parameters**: Start and end times must be between 0 and 190 seconds.
- **Seed Values**: Seed must be between 0 and 4294967294 (0 for random generation).
- **Steps Parameter**: Sampling steps must be between 4 and 8 (higher values improve quality but increase processing time).
- **File Requirements**: Same as A2A - MP3/WAV format, 6-190 seconds duration, max 50MB.
- **Processing Time**: Inpainting may take longer than other generation types due to advanced processing.

### Development Issues

#### Building Desktop App
- **Build fails**: Ensure all dependencies are installed in both root and SA25-desktop directories
- **Missing files**: Run the copy script: `cd SA25-desktop && node scripts/copy-dist.js`
- **Electron errors**: Rebuild electron native modules: `cd SA25-desktop && npm rebuild`

#### Cross-Platform Building
- **macOS builds on Windows**: Use GitHub Actions or macOS virtual machine
- **Linux builds**: Ensure you have required system libraries installed
- **Code signing**: Production builds should be code-signed for distribution

## 🚀 Deployment Options

### For End Users
1. **Desktop App**: Download and run the installer - no additional setup required
2. **Shared Web Server**: Deploy the web version on a server for team access

### For Developers
1. **Local Development**: Use `npm run dev` for web development
2. **Desktop Development**: Use `cd SA25-desktop && npm run dev` for desktop development
3. **Production Builds**: Create both web and desktop distributions

### For Organizations
1. **Internal Distribution**: Distribute the desktop installer internally
2. **Server Deployment**: Deploy the web version on internal servers
3. **Customization**: Modify source code for organization-specific needs

---

*Powered by Stability AI's Stable Audio 2.5*

**Version**: 1.0.0  
**Last Updated**: January 2025  
**License**: Check individual component licenses  
**Support**: See GitHub issues for community support
