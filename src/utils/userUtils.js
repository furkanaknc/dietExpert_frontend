// User management utilities

const USER_ID_KEY = 'chat_user_id';
const USER_NAME_KEY = 'chat_user_name';

export const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const getCurrentUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const setCurrentUserId = (userId) => {
  localStorage.setItem(USER_ID_KEY, userId);
};

export const getCurrentUserName = () => {
  return localStorage.getItem(USER_NAME_KEY) || 'Anonymous';
};

export const setCurrentUserName = (name) => {
  localStorage.setItem(USER_NAME_KEY, name);
};

export const clearUserData = () => {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
};

// Convert file to base64 for image upload
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:image/[type];base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Validate file type and size
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  // 5MB default
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
  }

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  return true;
};
