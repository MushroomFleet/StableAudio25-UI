import React, { useState, useRef, useEffect } from 'react';
import { Download, Play, Pause, Music, Loader2, AlertCircle, RefreshCw, Clock, Upload, FileAudio, Scissors } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api';

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState('text2audio');
  
  // Text-to-Audio state
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(20);
  const [outputFormat, setOutputFormat] = useState('mp3');
  
  // Audio-to-Audio state
  const [a2aPrompt, setA2aPrompt] = useState('');
  const [a2aDuration, setA2aDuration] = useState(20);
  const [a2aOutputFormat, setA2aOutputFormat] = useState('mp3');
  const [strength, setStrength] = useState(0.7);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  
  // Audio Inpainting state
  const [inpaintPrompt, setInpaintPrompt] = useState('');
  const [inpaintDuration, setInpaintDuration] = useState(190);
  const [inpaintOutputFormat, setInpaintOutputFormat] = useState('mp3');
  const [maskStart, setMaskStart] = useState(30);
  const [maskEnd, setMaskEnd] = useState(190);
  const [seed, setSeed] = useState(0);
  const [steps, setSteps] = useState(8);
  const [inpaintUploadedFile, setInpaintUploadedFile] = useState(null);
  const [inpaintUploadedFileInfo, setInpaintUploadedFileInfo] = useState(null);
  
  // Shared state
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

  // Handle file upload for audio-to-audio
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^audio\/(mp3|mpeg|wav)$/)) {
      setError('Please upload an MP3 or WAV file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploadedFile(file);
    setError('');

    // Get audio duration
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      const duration = Math.round(audio.duration);
      
      // Validate duration (6-190 seconds)
      if (duration < 6 || duration > 190) {
        setError('Audio file must be between 6 and 190 seconds long');
        setUploadedFile(null);
        setUploadedFileInfo(null);
        return;
      }

      setUploadedFileInfo({
        duration: duration,
        size: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
      });
    };
    audio.onerror = () => {
      setError('Unable to load audio file. Please try a different file.');
      setUploadedFile(null);
      setUploadedFileInfo(null);
    };
    audio.src = URL.createObjectURL(file);
  };

  // Handle file upload for inpainting
  const handleInpaintFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^audio\/(mp3|mpeg|wav)$/)) {
      setError('Please upload an MP3 or WAV file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setInpaintUploadedFile(file);
    setError('');

    // Get audio duration
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      const duration = Math.round(audio.duration);
      
      // Validate duration (6-190 seconds)
      if (duration < 6 || duration > 190) {
        setError('Audio file must be between 6 and 190 seconds long');
        setInpaintUploadedFile(null);
        setInpaintUploadedFileInfo(null);
        return;
      }

      setInpaintUploadedFileInfo({
        duration: duration,
        size: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
      });

      // Auto-adjust mask end to file duration if needed
      if (maskEnd > duration) {
        setMaskEnd(duration);
      }
    };
    audio.onerror = () => {
      setError('Unable to load audio file. Please try a different file.');
      setInpaintUploadedFile(null);
      setInpaintUploadedFileInfo(null);
    };
    audio.src = URL.createObjectURL(file);
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

  const handleA2AGenerate = async () => {
    if (!a2aPrompt.trim()) {
      setError('Please enter a transformation description');
      return;
    }

    if (!uploadedFile) {
      setError('Please upload an audio file');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('prompt', a2aPrompt.trim());
      formData.append('audio', uploadedFile);
      formData.append('duration', parseInt(a2aDuration));
      formData.append('output_format', a2aOutputFormat);
      formData.append('strength', strength);
      formData.append('model', 'stable-audio-2.5');

      const response = await axios.post(`${API_BASE_URL}/audio/generate-a2a`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessMessage('Audio transformed successfully! Check the gallery below.');
        // Clear form
        setA2aPrompt('');
        setUploadedFile(null);
        setUploadedFileInfo(null);
        // Auto-refresh gallery after successful generation
        fetchAudioFiles();
      }
    } catch (err) {
      console.error('A2A Generation error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to transform audio'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInpaintGenerate = async () => {
    if (!inpaintPrompt.trim()) {
      setError('Please enter an inpainting description');
      return;
    }

    if (!inpaintUploadedFile) {
      setError('Please upload an audio file');
      return;
    }

    // Validate mask times
    if (maskStart >= maskEnd) {
      setError('Mask start time must be less than mask end time');
      return;
    }

    if (inpaintUploadedFileInfo && maskEnd > inpaintUploadedFileInfo.duration) {
      setError('Mask end time cannot exceed audio file duration');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('prompt', inpaintPrompt.trim());
      formData.append('audio', inpaintUploadedFile);
      formData.append('duration', parseInt(inpaintDuration));
      formData.append('output_format', inpaintOutputFormat);
      formData.append('mask_start', maskStart);
      formData.append('mask_end', maskEnd);
      formData.append('seed', parseInt(seed));
      formData.append('steps', parseInt(steps));
      formData.append('model', 'stable-audio-2.5');

      const response = await axios.post(`${API_BASE_URL}/audio/generate-inpaint`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessMessage('Audio inpainted successfully! Check the gallery below.');
        // Clear form
        setInpaintPrompt('');
        setInpaintUploadedFile(null);
        setInpaintUploadedFileInfo(null);
        // Auto-refresh gallery after successful generation
        fetchAudioFiles();
      }
    } catch (err) {
      console.error('Inpainting error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to inpaint audio'
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
            Generate and transform high-quality audio using text prompts and audio inputs
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('text2audio')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'text2audio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Music className="icon-sm inline mr-1" />
                Text to Audio
              </button>
              <button
                onClick={() => setActiveTab('audio2audio')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ml-4 ${
                  activeTab === 'audio2audio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileAudio className="icon-sm inline mr-1" />
                Audio to Audio
              </button>
              <button
                onClick={() => setActiveTab('inpainting')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ml-4 ${
                  activeTab === 'inpainting'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Scissors className="icon-sm inline mr-1" />
                Audio Inpainting
              </button>
            </div>

            {/* Text to Audio Form */}
            {activeTab === 'text2audio' && (
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
              </div>
            )}

            {/* Audio to Audio Form */}
            {activeTab === 'audio2audio' && (
              <div className="space-y-6">
                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Upload Audio File
                  </label>
                  <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => document.getElementById('audioFileInput').click()}
                  >
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <FileAudio className="icon text-green-500 mx-auto" />
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        {uploadedFileInfo && (
                          <p className="text-xs text-gray-500">
                            Duration: {uploadedFileInfo.duration}s | Size: {uploadedFileInfo.size}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setUploadedFileInfo(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="icon text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          MP3 or WAV files (6-190 seconds, max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="audioFileInput"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>

                {/* Prompt Input */}
                <div className="form-group">
                  <label htmlFor="a2aPrompt" className="form-label">
                    Transformation Description
                  </label>
                  <textarea
                    id="a2aPrompt"
                    value={a2aPrompt}
                    onChange={(e) => setA2aPrompt(e.target.value)}
                    placeholder="Describe how you want to transform the audio... e.g., 'Make it sound more upbeat with electronic elements'"
                    className="form-textarea"
                    rows="4"
                    disabled={isLoading}
                  />
                </div>

                {/* Strength Parameter */}
                <div className="form-group">
                  <label htmlFor="strength" className="form-label">
                    Transformation Strength
                  </label>
                  <div className="space-y-2">
                    <input
                      id="strength"
                      type="range"
                      min="0.01"
                      max="1"
                      step="0.01"
                      value={strength}
                      onChange={(e) => setStrength(parseFloat(e.target.value))}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtle (0.01)</span>
                      <span className="font-medium">Current: {strength}</span>
                      <span>Complete (1.0)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Lower values preserve more of the original audio, higher values create more transformation
                  </p>
                </div>

                {/* Duration Input */}
                <div className="form-group">
                  <label htmlFor="a2aDuration" className="form-label">
                    Duration (seconds)
                  </label>
                  <input
                    id="a2aDuration"
                    type="number"
                    value={a2aDuration}
                    onChange={(e) => setA2aDuration(Math.max(1, Math.min(190, parseInt(e.target.value) || 20)))}
                    className="form-input"
                    min="1"
                    max="190"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-1">Range: 1-190 seconds</p>
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
                        name="a2aOutputFormat"
                        value="mp3"
                        checked={a2aOutputFormat === 'mp3'}
                        onChange={(e) => setA2aOutputFormat(e.target.value)}
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
                        name="a2aOutputFormat"
                        value="wav"
                        checked={a2aOutputFormat === 'wav'}
                        onChange={(e) => setA2aOutputFormat(e.target.value)}
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
                  onClick={handleA2AGenerate}
                  disabled={isLoading || !a2aPrompt.trim() || !uploadedFile}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="icon-sm animate-spin" />
                      Transforming Audio...
                    </>
                  ) : (
                    <>
                      <FileAudio className="icon-sm" />
                      Transform Audio
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Audio Inpainting Form */}
            {activeTab === 'inpainting' && (
              <div className="space-y-6">
                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Upload Audio File
                  </label>
                  <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => document.getElementById('inpaintAudioFileInput').click()}
                  >
                    {inpaintUploadedFile ? (
                      <div className="space-y-2">
                        <FileAudio className="icon text-green-500 mx-auto" />
                        <p className="text-sm font-medium text-gray-900">{inpaintUploadedFile.name}</p>
                        {inpaintUploadedFileInfo && (
                          <p className="text-xs text-gray-500">
                            Duration: {inpaintUploadedFileInfo.duration}s | Size: {inpaintUploadedFileInfo.size}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInpaintUploadedFile(null);
                            setInpaintUploadedFileInfo(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="icon text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          MP3 or WAV files (6-190 seconds, max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="inpaintAudioFileInput"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleInpaintFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>

                {/* Prompt Input */}
                <div className="form-group">
                  <label htmlFor="inpaintPrompt" className="form-label">
                    Inpainting Description
                  </label>
                  <textarea
                    id="inpaintPrompt"
                    value={inpaintPrompt}
                    onChange={(e) => setInpaintPrompt(e.target.value)}
                    placeholder="Describe what you want to replace in the selected time range... e.g., 'A solo violin melody' or 'Ambient nature sounds'"
                    className="form-textarea"
                    rows="4"
                    disabled={isLoading}
                  />
                </div>

                {/* Mask Time Range */}
                <div className="form-group">
                  <label className="form-label">
                    Inpainting Time Range
                  </label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="maskStart" className="text-sm font-medium text-gray-700 block mb-1">
                          Start Time (seconds)
                        </label>
                        <input
                          id="maskStart"
                          type="number"
                          value={maskStart}
                          onChange={(e) => setMaskStart(Math.max(0, Math.min(190, parseFloat(e.target.value) || 0)))}
                          className="form-input"
                          min="0"
                          max="190"
                          step="0.1"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label htmlFor="maskEnd" className="text-sm font-medium text-gray-700 block mb-1">
                          End Time (seconds)
                        </label>
                        <input
                          id="maskEnd"
                          type="number"
                          value={maskEnd}
                          onChange={(e) => setMaskEnd(Math.max(0, Math.min(190, parseFloat(e.target.value) || 190)))}
                          className="form-input"
                          min="0"
                          max="190"
                          step="0.1"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Selected range: {maskStart}s - {maskEnd}s ({(maskEnd - maskStart).toFixed(1)}s duration)</p>
                      {inpaintUploadedFileInfo && (
                        <p>Audio file duration: {inpaintUploadedFileInfo.duration}s</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className="form-group">
                  <label className="form-label">
                    Advanced Parameters
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="seed" className="text-sm font-medium text-gray-700 block mb-1">
                        Seed (0 = random)
                      </label>
                      <input
                        id="seed"
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Math.max(0, Math.min(4294967294, parseInt(e.target.value) || 0)))}
                        className="form-input"
                        min="0"
                        max="4294967294"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="steps" className="text-sm font-medium text-gray-700 block mb-1">
                        Sampling Steps
                      </label>
                      <input
                        id="steps"
                        type="number"
                        value={steps}
                        onChange={(e) => setSteps(Math.max(4, Math.min(8, parseInt(e.target.value) || 8)))}
                        className="form-input"
                        min="4"
                        max="8"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>Seed: Controls randomness (0 for random generation)</p>
                    <p>Steps: Number of denoising steps (4-8, higher = better quality but slower)</p>
                  </div>
                </div>

                {/* Duration Input */}
                <div className="form-group">
                  <label htmlFor="inpaintDuration" className="form-label">
                    Duration (seconds)
                  </label>
                  <input
                    id="inpaintDuration"
                    type="number"
                    value={inpaintDuration}
                    onChange={(e) => setInpaintDuration(Math.max(1, Math.min(190, parseInt(e.target.value) || 190)))}
                    className="form-input"
                    min="1"
                    max="190"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-1">Range: 1-190 seconds</p>
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
                        name="inpaintOutputFormat"
                        value="mp3"
                        checked={inpaintOutputFormat === 'mp3'}
                        onChange={(e) => setInpaintOutputFormat(e.target.value)}
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
                        name="inpaintOutputFormat"
                        value="wav"
                        checked={inpaintOutputFormat === 'wav'}
                        onChange={(e) => setInpaintOutputFormat(e.target.value)}
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
                  onClick={handleInpaintGenerate}
                  disabled={isLoading || !inpaintPrompt.trim() || !inpaintUploadedFile}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="icon-sm animate-spin" />
                      Inpainting Audio...
                    </>
                  ) : (
                    <>
                      <Scissors className="icon-sm" />
                      Inpaint Audio
                    </>
                  )}
                </button>
              </div>
            )}

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
                            <div className="flex items-center mb-2">
                              <p style={{fontWeight: 500, color: '#374151', marginRight: '0.5rem'}}>{file.filename}</p>
                              {/* Type Badge */}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                file.type === 'audio-to-audio' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : file.type === 'audio-inpainting'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {file.type === 'audio-to-audio' ? 'A2A' : file.type === 'audio-inpainting' ? 'INP' : 'T2A'}
                              </span>
                            </div>

                            {/* Prompt Display */}
                            {file.prompt && (
                              <div className="mb-2">
                                <p style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem'}}>
                                  {file.type === 'audio-to-audio' ? 'Transformation:' : 
                                   file.type === 'audio-inpainting' ? 'Inpainting:' : 'Prompt:'}
                                </p>
                                <p style={{fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic', lineHeight: '1.4'}}>{file.prompt}</p>
                              </div>
                            )}

                            {/* Audio-to-Audio specific metadata */}
                            {file.type === 'audio-to-audio' && (
                              <div className="mb-2">
                                {file.source_filename && (
                                  <div className="mb-1">
                                    <p style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem'}}>Source Audio:</p>
                                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{file.source_filename}</p>
                                  </div>
                                )}
                                {file.strength && (
                                  <div>
                                    <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563'}}>Strength:</span>
                                    <span style={{fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.25rem'}}>{file.strength}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Audio Inpainting specific metadata */}
                            {file.type === 'audio-inpainting' && (
                              <div className="mb-2">
                                {file.source_filename && (
                                  <div className="mb-1">
                                    <p style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', marginBottom: '0.25rem'}}>Source Audio:</p>
                                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{file.source_filename}</p>
                                  </div>
                                )}
                                {(file.mask_start !== undefined && file.mask_end !== undefined) && (
                                  <div className="mb-1">
                                    <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563'}}>Inpaint Range:</span>
                                    <span style={{fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.25rem'}}>
                                      {file.mask_start}s - {file.mask_end}s
                                    </span>
                                  </div>
                                )}
                                {file.seed !== undefined && file.seed !== 0 && (
                                  <div className="mb-1">
                                    <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563'}}>Seed:</span>
                                    <span style={{fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.25rem'}}>{file.seed}</span>
                                  </div>
                                )}
                                {file.steps && (
                                  <div>
                                    <span style={{fontSize: '0.875rem', fontWeight: 500, color: '#4b5563'}}>Steps:</span>
                                    <span style={{fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.25rem'}}>{file.steps}</span>
                                  </div>
                                )}
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
                        onClick={async () => {
                          // Check if we're in Electron environment
                          if (window.electronAPI && window.electronAPI.downloadFile) {
                            try {
                              const result = await window.electronAPI.downloadFile(file.url, file.filename);
                              if (result.success) {
                                setSuccessMessage(`File saved successfully!`);
                              } else if (result.canceled) {
                                // User canceled the save dialog - do nothing
                              } else {
                                setError(`Download failed: ${result.error || 'Unknown error'}`);
                              }
                            } catch (error) {
                              console.error('Download error:', error);
                              setError(`Download failed: ${error.message}`);
                            }
                          } else {
                            // Fallback to web download method
                            const link = document.createElement('a');
                            link.href = `${API_BASE_URL}${file.url}`;
                            link.download = file.filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
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
                      src={file.url}
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
