import { UserIcon, CpuChipIcon, PhotoIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { formatMessageTime, getMessageDisplayText, getMediaItems } from '../utils/messageUtils';
import MarkdownRenderer from './MarkdownRenderer';
import CalorieNotification from './CalorieNotification';

const Message = ({ message, isUser, user }) => {
  const displayText = getMessageDisplayText(message);
  const mediaItems = getMediaItems(message.content);

  const getUserDisplayName = () => {
    if (!isUser) return 'DietExpert';
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1).toLowerCase();
    }
    return 'You';
  };

  return (
    <div
      className={`flex gap-2 sm:gap-3 px-2 sm:px-4 py-3 border-b border-gray-50 ${isUser ? 'bg-blue-50/30' : 'bg-white'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
        }`}
      >
        {isUser ? <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" /> : <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 text-sm">{getUserDisplayName()}</span>
          <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
        </div>

        {/* Text content */}
        {displayText && (
          <div className="prose prose-sm max-w-none">
            {isUser ? (
              <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">{displayText}</div>
            ) : (
              <MarkdownRenderer content={displayText} />
            )}
          </div>
        )}

        {/* Media content */}
        {mediaItems.length > 0 && (
          <div className="mt-2 space-y-2">
            {mediaItems.map((item, index) => (
              <div key={index}>
                {item.type === 'IMAGE' && (
                  <div className="max-w-xs sm:max-w-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <PhotoIcon className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">Image</span>
                    </div>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.metadata?.alt_text || 'Uploaded image'}
                        className="rounded-lg border border-gray-200 max-w-full h-auto"
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    {item.metadata?.caption && <p className="text-xs text-gray-600 mt-1">{item.metadata.caption}</p>}
                  </div>
                )}

                {item.type === 'AUDIO' && (
                  <div className="max-w-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <SpeakerWaveIcon className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">Audio</span>
                      {item.duration && <span className="text-xs text-gray-500">({item.duration}s)</span>}
                    </div>
                    {item.audio_url ? (
                      <audio controls className="w-full h-8" preload="metadata">
                        <source src={item.audio_url} type={`audio/${item.metadata?.format || 'mp3'}`} />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <div className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    {item.transcription && (
                      <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <span className="font-medium">Transcription: </span>
                        {item.transcription}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Calorie notification for user messages with food content */}
        {isUser && displayText && <CalorieNotification messageId={message.id} content={displayText} />}

        {/* Token usage for AI messages */}
        {!isUser && message.usage && (
          <div className="mt-1 text-xs text-gray-400">Tokens: {message.usage.totalTokens}</div>
        )}
      </div>
    </div>
  );
};

export default Message;
