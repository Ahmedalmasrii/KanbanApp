import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

const LicenseActivation = ({ onLicenseActivated }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');

  const handleActivate = async () => {
    try {
      const response = await axios.post('/license/activate', { licenseKey });
      localStorage.setItem('licenseKey', licenseKey);
      onLicenseActivated();
    } catch (err) {
      setError(err.response?.data?.msg || 'Kunde inte aktivera licensen.');
    }
  };

  return (
    <div>
      <h2>Aktivera Licens</h2>
      <input
        type="text"
        placeholder="Ange licensnyckel"
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
      />
      <button onClick={handleActivate}>Aktivera</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LicenseActivation;
