import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { fileToBase64, validateImageFile } from '../utils/userUtils';

const MessageInput = ({ onSendMessage, onSendImageMessage, onSendAudioMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() && !selectedImage && !audioBlob) return;

    setError('');

    try {
      if (selectedImage) {
        const base64Data = await fileToBase64(selectedImage);
        await onSendImageMessage(
          message.trim() || 'Analyze this meal for nutrition content',
          base64Data,
          selectedImage.type,
        );

        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (audioBlob) {
        const base64Data = await fileToBase64(audioBlob);
        await onSendAudioMessage(message.trim(), base64Data, audioBlob.type);

        setAudioBlob(null);
        setRecordingTime(0);
      } else {
        await onSendMessage(message.trim());
      }

      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      setError('');
    } catch (err) {
      setError(err.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        blob.name = `audio_${Date.now()}.webm`;
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* Error message */}
      {error && <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">{error}</div>}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img src={imagePreview} alt="Preview" className="max-w-24 max-h-24 rounded-md border border-gray-200" />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
          <div className="text-xs text-gray-500 mt-1 max-w-24">
            {selectedImage?.name} ({Math.round(selectedImage?.size / 1024)}KB)
          </div>
        </div>
      )}

      {/* Audio preview */}
      {audioBlob && (
        <div className="mb-2 relative inline-block bg-blue-50 border border-blue-200 rounded-md p-2">
          <div className="flex items-center gap-2">
            <MicrophoneIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">Audio recorded ({formatTime(recordingTime)})</span>
            <button onClick={handleRemoveAudio} className="text-red-500 hover:text-red-700 ml-auto">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded-md p-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-700">Recording... {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        {/* Image upload button */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={disabled || isLoading || isRecording || audioBlob}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading || isRecording || audioBlob}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload food photo"
          >
            <PhotoIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Audio record button */}
        <div className="relative">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isLoading || selectedImage}
            className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={isRecording ? 'Stop recording' : 'Record audio message'}
          >
            {isRecording ? <StopIcon className="h-4 w-4" /> : <MicrophoneIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Message input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedImage
                ? 'Ask about the nutritional content...'
                : audioBlob
                  ? 'Optional: Add text to your audio message...'
                  : 'Ask about nutrition, diet plans, recipes...'
            }
            disabled={disabled || isLoading || isRecording}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-sm"
            rows="1"
            style={{
              minHeight: '36px',
              maxHeight: '100px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage && !audioBlob) || disabled || isLoading || isRecording}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          title="Send message"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <PaperAirplaneIcon className="h-4 w-4" />
          )}
        </button>
      </form>

      <div className="text-xs text-gray-500 mt-1">
        Press Enter to send, Shift+Enter for new line
        {selectedImage && ' • Food photo will be analyzed for nutrition'}
        {audioBlob && ' • Audio message ready to send'}
        {isRecording && ' • Click stop when finished recording'}
      </div>
    </div>
  );
};

export default MessageInput;
