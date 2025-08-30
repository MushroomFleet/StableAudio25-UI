# Stability Audio 2 UI - Local Distribution

A local web application for generating high-quality audio using Stability AI's Stable Audio 2.5 model.

Branch History:
v1 = text to audio only
v2 = audio to audio / text to audio only

## Features

- Generate audio from text prompts
- Adjustable duration (1-120 seconds)
- Multiple output formats (MP3, WAV)
- Audio gallery with playback controls
- Local file storage
- Optimized production build

## Prerequisites

- Node.js (v16 or higher)
- NPM
- Stability AI API key

## Setup Instructions

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure API Key
1. Copy the `.env` file in the root directory
2. Add your Stability AI API key:
```
STABILITY_API_KEY=your_api_key_here
```

### 3. Development Mode (Optional)
To run in development mode with hot reload:
```bash
npm run dev
```
This starts both the client (http://localhost:3000) and server (http://localhost:5000).

### 4. Production Mode
For the optimized production version:

#### Build the application:
```bash
npm run build:full
```

#### Start the production server:
```bash
npm start
```

#### Or build and start in one command:
```bash
npm run start:prod
```

The application will be available at: **http://localhost:5000**

Note: Make sure port 5000 is not being used by other applications when starting the production server.

## Production Features

- Optimized and minified client code
- Single server serving both API and frontend
- Smaller bundle sizes with tree shaking
- Production-ready static asset serving

## File Structure

```
sa2-audio-app/
├── client/                 # React frontend
│   ├── dist/              # Built production files
│   └── src/               # Source code
├── server/                # Express backend
│   ├── src/               # Server source code
│   └── uploads/           # Generated audio files
├── .env                   # Environment variables
└── package.json           # Main project configuration
```

## Usage

1. Enter a text description of the audio you want to generate
2. Set the desired duration (1-120 seconds)
3. Choose output format (MP3 or WAV)
4. Click "Generate Audio"
5. View and play generated files in the gallery below

## Generated Files

All generated audio files are stored locally in the `server/uploads/` directory and can be:
- Played directly in the browser
- Downloaded to your computer
- Managed through the gallery interface

## Troubleshooting

- **Port 5000 in use**: The server uses port 5000 by default. Make sure no other applications are using this port.
- **API Key Issues**: Ensure your Stability AI API key is correctly set in the `.env` file.
- **Missing Dependencies**: Run `npm run install:all` to ensure all dependencies are installed.

## Development Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build client for production
- `npm run build:full` - Build and show completion message
- `npm start` - Start production server
- `npm run start:prod` - Build and start production in one command
- `npm run install:all` - Install dependencies for all packages

---

*Powered by Stability AI's Stable Audio 2.5*

