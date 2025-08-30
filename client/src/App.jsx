import React, { useState, useRef, useEffect } from 'react';
import { Download, Play, Pause, Music, Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api';

function App() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(20);
  const [outputFormat, setOutputFormat] = useState('mp3');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Audio Gallery State
  const [audioFiles, setAudioFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const galleryAudioRefs = useRef({});

  // Fetch audio files from server
  const fetchAudioFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/audio/files`);
      setAudioFiles(response.data.files || []);
    } catch (err) {
      console.error('Error fetching audio files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  // Handle gallery audio playback
  const handleGalleryPlayPause = (filename) => {
    const audioElement = galleryAudioRefs.current[filename];
    if (!audioElement) return;

    // Pause any currently playing audio
    if (currentlyPlaying && currentlyPlaying !== filename) {
      const currentAudio = galleryAudioRefs.current[currentlyPlaying];
      if (currentAudio) {
        currentAudio.pause();
      }
    }

    // Toggle current audio
    if (currentlyPlaying === filename) {
      audioElement.pause();
      setCurrentlyPlaying(null);
    } else {
      audioElement.play();
      setCurrentlyPlaying(filename);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/audio/generate`, {
        prompt: prompt.trim(),
        duration: parseInt(duration),
        output_format: outputFormat,
        model: 'stable-audio-2.5'
      });

      if (response.data.success) {
        setSuccessMessage('Audio generated successfully! Check the gallery below.');
        // Auto-refresh gallery after successful generation
        fetchAudioFiles();
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to generate audio'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient">
      <div className="container">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="icon" />
            <h1 className="title">
              Stability Audio 2
            </h1>
          </div>
          <p className="subtitle">
            Generate high-quality audio from text prompts
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="form-group">
              <label htmlFor="prompt" className="form-label">
                Audio Description
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the audio you want to generate... e.g., 'A cheerful acoustic guitar melody with soft drums'"
                className="form-textarea"
                rows="4"
                disabled={isLoading}
              />
            </div>

            {/* Duration Input */}
            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                Duration (seconds)
              </label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Math.min(120, parseInt(e.target.value) || 20)))}
                className="form-input"
                min="1"
                max="120"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">Range: 1-120 seconds</p>
            </div>

            {/* Output Format Selection */}
            <div className="form-group">
              <label className="form-label">
                Output Format
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="mp3"
                    checked={outputFormat === 'mp3'}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={isLoading}
                    className="form-input"
                    style={{width: 'auto', marginRight: '0.5rem'}}
                  />
                  <span className="text-sm" style={{fontWeight: 500}}>MP3</span>
                  <span className="text-sm text-gray-500 ml-2">(Smaller file size)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="outputFormat"
                    value="wav"
                    checked={outputFormat === 'wav'}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={isLoading}
                    className="form-input"
                    style={{width: 'auto', marginRight: '0.5rem'}}
                  />
                  <span className="text-sm" style={{fontWeight: 500}}>WAV</span>
                  <span className="text-sm text-gray-500 ml-2">(Higher quality)</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="icon-sm animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Music className="icon-sm" />
                  Generate Audio
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="alert-error">
                <AlertCircle className="icon-sm" />
                <div>
                  <p style={{fontWeight: 500}}>Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="alert-success">
                <div className="flex items-center justify-center">
                  <Music className="icon-sm" style={{marginRight: '0.5rem', color: '#166534'}} />
                  <p style={{fontWeight: 500, color: '#166534'}}>{successMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audio Gallery */}
        <div className="card mt-8">
          <div className="space-y-6">
            {/* Gallery Header */}
            <div className="flex items-center justify-between">
              <h2 style={{fontSize: '1.5rem', fontWeight: 600, color: '#1f2937'}}>
                Audio Gallery
              </h2>
              <button
                onClick={fetchAudioFiles}
                disabled={isLoadingFiles}
                className="btn-secondary"
                style={{width: 'auto'}}
              >
                {isLoadingFiles ? (
                  <>
                    <Loader2 className="icon-md animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="icon-md" />
                    Refresh
                  </>
                )}
              </button>
            </div>

            {/* Files List */}
            {isLoadingFiles && audioFiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Loader2 className="icon animate-spin" style={{margin: '0 auto 1rem'}} />
                <p>Loading audio files...</p>
              </div>
            ) : audioFiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Music className="icon" style={{margin: '0 auto 1rem', opacity: 0.3}} />
                <p>No audio files found. Generate some audio to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {audioFiles.map((file) => (
                  <div key={file.filename} className="card" style={{padding: '1.5rem', backgroundColor: '#f9fafb'}}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleGalleryPlayPause(file.filename)}
                            className="btn-secondary"
                            style={{width: 'auto', padding: '0.5rem', marginTop: '0.25rem'}}
                          >
                            {currentlyPlaying === file.filename ? (
                              <Pause className="icon-md" />
                            ) : (
                              <Play className="icon-md" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <p style={{fontWeight: 500, color: '#374151', marginBottom: '0.5rem'}}>{file.filename}</p>
                            
                            {/* Prompt Display */}
                            {file.prompt && (
                              <div className="mb-2">
                                <p style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem'}}>Prompt:</p>
                                <p style={{fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic', lineHeight: '1.4'}}>{file.prompt}</p>
                              </div>
                            )}
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                              <div className="flex items-center">
                                <Clock className="icon-md" style={{marginRight: '0.25rem'}} />
                                {formatTimestamp(file.created)}
                              </div>
                              {file.duration && (
                                <div>
                                  <span style={{fontWeight: 500}}>Duration:</span> {file.duration}s
                                </div>
                              )}
                              {file.output_format && (
                                <div>
                                  <span style={{fontWeight: 500}}>Format:</span> {file.output_format?.toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `${API_BASE_URL}${file.url}`;
                          link.download = file.filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="btn-primary"
                        style={{width: 'auto', marginLeft: '1rem'}}
                      >
                        <Download className="icon-md" />
                        Download
                      </button>
                    </div>
                    
                    {/* Hidden Audio Element */}
                    <audio
                      ref={(el) => {
                        if (el) {
                          galleryAudioRefs.current[file.filename] = el;
                        }
                      }}
                      src={`/${file.filename}`}
                      onEnded={() => setCurrentlyPlaying(null)}
                      preload="metadata"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Stability AI's Stable Audio 2.5</p>
        </div>
      </div>
    </div>
  );
}

export default App;
