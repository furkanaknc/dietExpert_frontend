import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Apple, ArrowLeft } from 'lucide-react';
import { nutritionAPI } from '../services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const CalorieDashboard = () => {
  const navigate = useNavigate();
  const [dailyStats, setDailyStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState('daily');

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const daily = await nutritionAPI.getDailyStats(selectedDate);
      setDailyStats(daily);

      if (viewMode === 'daily') {
        const chartData = await nutritionAPI.getDailyChartData(7);
        setWeeklyData(chartData.data);
      } else if (viewMode === 'weekly') {
        const chartData = await nutritionAPI.getWeeklyChartData(4);
        setWeeklyData(chartData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Main Page</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Calorie Tracking</h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
                Analyze your nutrition data and track your goals
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 sm:mt-4 md:mt-0 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${
                  viewMode === 'daily' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${
                  viewMode === 'weekly' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Daily Calories</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{dailyStats?.total_calories || 0}</p>
                {dailyStats?.goal_calories && (
                  <p className="text-xs sm:text-sm text-gray-500">Goal: {dailyStats.goal_calories}</p>
                )}
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Apple className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            {dailyStats?.goal_calories && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((dailyStats.total_calories / dailyStats.goal_calories) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((dailyStats.total_calories / dailyStats.goal_calories) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Calorie Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              {viewMode === 'daily' ? 'Last 7 Days Trend' : 'Last 4 Weeks Trend'}
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={viewMode === 'daily' ? 'date' : 'week_start'} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={viewMode === 'daily' ? 'calories' : 'average_calories'}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                  {viewMode === 'daily' && (
                    <Line
                      type="monotone"
                      dataKey="goal_calories"
                      stroke="#EF4444"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieDashboard;
