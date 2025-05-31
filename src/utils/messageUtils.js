// Utility functions for message handling

export const createTextContent = (text) => ({
  items: [
    {
      type: 'TEXT',
      text: text,
    },
  ],
  combined_text: text,
});

export const createImageContent = (text, imageUrl, metadata = {}) => ({
  items: [
    {
      type: 'TEXT',
      text: text,
    },
    {
      type: 'IMAGE',
      image_url: imageUrl,
      width: metadata.width || 800,
      height: metadata.height || 600,
      file_size: metadata.file_size || 0,
      metadata: {
        format: metadata.format || 'jpg',
        alt_text: metadata.alt_text || 'Uploaded image',
        ...metadata,
      },
    },
  ],
  combined_text: text,
});

export const createAudioContent = (text, audioUrl, metadata = {}) => ({
  items: [
    {
      type: 'TEXT',
      text: text,
    },
    {
      type: 'AUDIO',
      audio_url: audioUrl,
      duration: metadata.duration || 0,
      file_size: metadata.file_size || 0,
      transcription: metadata.transcription || '',
      metadata: {
        format: metadata.format || 'mp3',
        bitrate: metadata.bitrate || 128,
        ...metadata,
      },
    },
  ],
  combined_text: text + (metadata.transcription ? `: ${metadata.transcription}` : ''),
});

export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

  return date.toLocaleDateString();
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateChatTitle = (firstMessage) => {
  if (!firstMessage) return 'New Chat';

  const text = firstMessage.content?.combined_text || firstMessage.content?.items?.[0]?.text || 'New Chat';
  return truncateText(text, 30);
};

export const getMessageDisplayText = (message) => {
  if (!message.content) return '';

  if (message.content.combined_text) {
    return message.content.combined_text;
  }

  if (message.content.items && message.content.items.length > 0) {
    const textItems = message.content.items.filter((item) => item.type === 'TEXT');
    return textItems.map((item) => item.text).join(' ');
  }

  return '';
};

export const hasMediaContent = (content) => {
  if (!content?.items) return false;
  return content.items.some((item) => item.type === 'IMAGE' || item.type === 'AUDIO');
};

export const getMediaItems = (content) => {
  if (!content?.items) return [];
  return content.items.filter((item) => item.type === 'IMAGE' || item.type === 'AUDIO');
};
