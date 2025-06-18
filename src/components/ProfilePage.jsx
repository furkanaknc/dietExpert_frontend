import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { ArrowLeftIcon, UserIcon, KeyIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Link, Navigate } from 'react-router-dom';
import { parseBackendError } from '../utils/errorHandler';

const ProfilePage = () => {
  const { user, setUser, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [originalProfileData, setOriginalProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [personalData, setPersonalData] = useState({
    weight: '',
    height: '',
    age: '',
    sex: '',
  });

  const [originalPersonalData, setOriginalPersonalData] = useState({
    weight: '',
    height: '',
    age: '',
    sex: '',
  });

  const [healthData, setHealthData] = useState({
    activity_level: '',
    goal: '',
    dietary_restrictions: [],
    medical_conditions: [],
    allergies: [],
  });

  // Original health data to track changes
  const [originalHealthData, setOriginalHealthData] = useState({
    activity_level: '',
    goal: '',
    dietary_restrictions: [],
    medical_conditions: [],
    allergies: [],
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, personal, health

  useEffect(() => {
    if (user) {
      const initialProfileData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      };
      setProfileData(initialProfileData);
      setOriginalProfileData(initialProfileData);

      // Load personal information
      loadPersonalInformation();
    }
  }, [user]);

  const loadPersonalInformation = async () => {
    try {
      const personalInfo = await profileAPI.getPersonalInformation();

      if (personalInfo.profile) {
        const initialPersonalData = {
          weight: personalInfo.profile.weight || '',
          height: personalInfo.profile.height || '',
          age: personalInfo.profile.age || '',
          sex: personalInfo.profile.sex || '',
        };
        setPersonalData(initialPersonalData);
        setOriginalPersonalData(initialPersonalData);
      }

      if (personalInfo.health) {
        const initialHealthData = {
          activity_level: personalInfo.health.activity_level || '',
          goal: personalInfo.health.goal || '',
          dietary_restrictions: personalInfo.health.dietary_restrictions || [],
          medical_conditions: personalInfo.health.medical_conditions || [],
          allergies: personalInfo.health.allergies || [],
        };
        setHealthData(initialHealthData);
        setOriginalHealthData(initialHealthData);
      }
    } catch (err) {
      console.error('Failed to load personal information:', err);
    }
  };

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHealthChange = (e) => {
    const { name, value } = e.target;
    setHealthData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setHealthData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setHealthData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setHealthData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const changedFields = {};
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== originalProfileData[key] && profileData[key] !== '') {
          changedFields[key] = profileData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setError('No changes detected');
        setLoading(false);
        return;
      }

      const updatedUser = await profileAPI.updateProfile(changedFields);
      setUser({ ...user, ...updatedUser });
      setSuccess('Profile updated successfully!');

      setOriginalProfileData(profileData);
    } catch (err) {
      setError(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const changedFields = {};
      Object.keys(personalData).forEach((key) => {
        const currentValue = personalData[key];
        const originalValue = originalPersonalData[key];

        if (currentValue !== originalValue) {
          if (key === 'weight' && currentValue) {
            changedFields[key] = parseFloat(currentValue);
          } else if (key === 'height' && currentValue) {
            changedFields[key] = parseFloat(currentValue);
          } else if (key === 'age' && currentValue) {
            changedFields[key] = parseInt(currentValue);
          } else if (key === 'sex' && currentValue) {
            changedFields[key] = currentValue;
          }
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setError('No changes detected');
        setLoading(false);
        return;
      }

      await profileAPI.updatePersonalInformation(changedFields);
      setSuccess('Personal information updated successfully!');

      setOriginalPersonalData(personalData);
    } catch (err) {
      setError(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleHealthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const changedFields = {};

      if (healthData.activity_level !== originalHealthData.activity_level && healthData.activity_level) {
        changedFields.activity_level = healthData.activity_level;
      }

      if (healthData.goal !== originalHealthData.goal && healthData.goal) {
        changedFields.goal = healthData.goal;
      }

      const currentDietaryRestrictions = healthData.dietary_restrictions.filter((item) => item.trim());
      const originalDietaryRestrictions = originalHealthData.dietary_restrictions.filter((item) => item.trim());
      if (JSON.stringify(currentDietaryRestrictions) !== JSON.stringify(originalDietaryRestrictions)) {
        changedFields.dietary_restrictions = currentDietaryRestrictions;
      }

      const currentMedicalConditions = healthData.medical_conditions.filter((item) => item.trim());
      const originalMedicalConditions = originalHealthData.medical_conditions.filter((item) => item.trim());
      if (JSON.stringify(currentMedicalConditions) !== JSON.stringify(originalMedicalConditions)) {
        changedFields.medical_conditions = currentMedicalConditions;
      }

      const currentAllergies = healthData.allergies.filter((item) => item.trim());
      const originalAllergies = originalHealthData.allergies.filter((item) => item.trim());
      if (JSON.stringify(currentAllergies) !== JSON.stringify(originalAllergies)) {
        changedFields.allergies = currentAllergies;
      }

      if (Object.keys(changedFields).length === 0) {
        setError('No changes detected');
        setLoading(false);
        return;
      }

      await profileAPI.updateHealth(changedFields);
      setSuccess('Health information updated successfully!');

      setOriginalHealthData({
        ...healthData,
        dietary_restrictions: currentDietaryRestrictions,
        medical_conditions: currentMedicalConditions,
        allergies: currentAllergies,
      });
    } catch (err) {
      setError(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await profileAPI.updateProfile({ password: passwordData.new_password });
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  const ActivityLevels = {
    SEDENTARY: 'Sedentary',
    LIGHTLY_ACTIVE: 'Lightly Active',
    MODERATELY_ACTIVE: 'Moderately Active',
    VERY_ACTIVE: 'Very Active',
    EXTRA_ACTIVE: 'Extra Active',
  };

  const Goals = {
    WEIGHT_LOSS: 'Weight Loss',
    WEIGHT_GAIN: 'Weight Gain',
    MAINTENANCE: 'Maintenance',
    MUSCLE_GAIN: 'Muscle Gain',
    HEALTH_IMPROVEMENT: 'Health Improvement',
    SPORTS_PERFORMANCE: 'Sports Performance',
    GENERAL_WELLNESS: 'General Wellness',
  };

  const SexOptions = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'personal'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('health')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'health'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Health Info
                </button>
              </div>
            </div>

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>

                {/* Password Change Section */}
                <div className="border-t border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <KeyIcon className="h-6 w-6 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                      </div>
                      {!showPasswordForm && (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Change Password
                        </button>
                      )}
                    </div>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                      <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="new_password"
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long.</p>
                      </div>

                      <div>
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm_password"
                          name="confirm_password"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              current_password: '',
                              new_password: '',
                              confirm_password: '',
                            });
                          }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <KeyIcon className="h-4 w-4" />
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600">Physical characteristics for personalized nutrition advice</p>
                </div>

                <form onSubmit={handlePersonalSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={personalData.weight}
                        onChange={handlePersonalChange}
                        step="0.1"
                        min="1"
                        max="300"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={personalData.height}
                        onChange={handlePersonalChange}
                        min="10"
                        max="250"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={personalData.age}
                        onChange={handlePersonalChange}
                        min="1"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                        Sex
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={personalData.sex}
                        onChange={handlePersonalChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {Object.entries(SexOptions).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Health Information Tab */}
            {activeTab === 'health' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Health Information</h2>
                  <p className="text-sm text-gray-600">
                    Health goals and dietary preferences for better recommendations
                  </p>
                </div>

                <form onSubmit={handleHealthSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Level
                      </label>
                      <select
                        id="activity_level"
                        name="activity_level"
                        value={healthData.activity_level}
                        onChange={handleHealthChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {Object.entries(ActivityLevels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                        Health Goal
                      </label>
                      <select
                        id="goal"
                        name="goal"
                        value={healthData.goal}
                        onChange={handleHealthChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {Object.entries(Goals).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                    <div className="space-y-2">
                      {healthData.dietary_restrictions.map((restriction, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={restriction}
                            onChange={(e) => handleArrayChange('dietary_restrictions', index, e.target.value)}
                            placeholder="e.g., Vegetarian, Gluten-free"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('dietary_restrictions', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('dietary_restrictions')}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                      >
                        + Add Dietary Restriction
                      </button>
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                    <div className="space-y-2">
                      {healthData.medical_conditions.map((condition, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => handleArrayChange('medical_conditions', index, e.target.value)}
                            placeholder="e.g., Diabetes, Hypertension"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('medical_conditions', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('medical_conditions')}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                      >
                        + Add Medical Condition
                      </button>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <div className="space-y-2">
                      {healthData.allergies.map((allergy, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={allergy}
                            onChange={(e) => handleArrayChange('allergies', index, e.target.value)}
                            placeholder="e.g., Nuts, Shellfish"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('allergies', index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('allergies')}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm"
                      >
                        + Add Allergy
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Profile Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profileData.first_name} {profileData.last_name}
                </h3>
                <p className="text-sm text-gray-600">{profileData.email}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium">Registered</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  {personalData.age && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Age</span>
                      <span className="font-medium">{personalData.age} years</span>
                    </div>
                  )}
                  {personalData.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weight</span>
                      <span className="font-medium">{personalData.weight} kg</span>
                    </div>
                  )}
                  {personalData.height && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Height</span>
                      <span className="font-medium">{personalData.height} cm</span>
                    </div>
                  )}
                  {healthData.goal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Goal</span>
                      <span className="font-medium">{Goals[healthData.goal] || healthData.goal}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Update Physical Info
                  </button>
                  <button
                    onClick={() => setActiveTab('health')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Set Health Goals
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
