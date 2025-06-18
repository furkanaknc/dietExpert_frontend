import React, { useState, useEffect } from 'react';
import { Apple, X } from 'lucide-react';
import { nutritionAPI } from '../services/api';

const CalorieNotification = ({ messageId, content, onClose }) => {
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (messageId && content) {
      parseFoodFromMessage();
    }
  }, [messageId, content]); // eslint-disable-line react-hooks/exhaustive-deps

  const parseFoodFromMessage = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await nutritionAPI.parseFood(content, messageId);

      if (result && result.length > 0) {
        setFoodEntries(result);
      } else {
        setFoodEntries([]);
      }
    } catch (err) {
      console.error('Error parsing food:', err);
      setError('Could not get calorie information');
      setFoodEntries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
          <div className="h-4 bg-blue-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error || !foodEntries || foodEntries.length === 0) {
    return null;
  }

  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-3 relative">
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center space-x-2 mb-3">
        <Apple className="w-5 h-5 text-green-600" />
        <h4 className="font-semibold text-gray-800">🍽️ Detected Foods</h4>
      </div>

      <div className="space-y-2 mb-4">
        {foodEntries.map((entry, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded-md p-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Apple className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{entry.food_name}</span>
              {entry.quantity && entry.unit && (
                <span className="text-xs text-gray-500">
                  ({entry.quantity} {entry.unit})
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-800">{entry.calories} kcal</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Apple className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Calories</p>
              <p className="text-sm font-bold text-gray-800">{totalCalories} kcal</p>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">✨ This data was automatically added to your calorie tracking</p>
        </div>
      </div>
    </div>
  );
};

export default CalorieNotification;
