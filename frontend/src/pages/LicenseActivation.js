import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

const LicenseActivation = ({ onLicenseActivated }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setError('');
    if (!licenseKey || !companyName) {
      setError('Både företagsnamn och licensnyckel krävs.');
      return;
    }

    try {
      const response = await axios.post('/license/activate', { licenseKey, companyName });
      localStorage.setItem('licenseKey', licenseKey);
      localStorage.setItem('companyName', companyName);
      onLicenseActivated();
    } catch (err) {
      setError(err.response?.data?.msg || 'Kunde inte aktivera licensen.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-teal-500">
      <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-full p-3 mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m3-8a9 9 0 100 18 9 9 0 000-18z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Aktivera Din Licens
          </h2>
          <p className="text-gray-500 text-center mt-2 text-sm">
            Ange dina uppgifter för att aktivera ditt konto
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Företagsnamn</label>
          <input
            type="text"
            placeholder="Ditt företagsnamn"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Licensnyckel</label>
          <input
            type="text"
            placeholder="Ange licensnyckel"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleActivate}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-2 rounded-lg transition duration-300 shadow-md"
        >
          Aktivera Licens
        </button>

        {error && (
          <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default LicenseActivation;
