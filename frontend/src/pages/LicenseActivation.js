import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

const LicenseActivation = ({ onLicenseActivated }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  const handleActivate = async () => {
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
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Aktivera Licens</h2>
      <input
        type="text"
        placeholder="Företagsnamn"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        style={{ marginBottom: '10px', width: '300px', padding: '8px' }}
      />
      <br />
      <input
        type="text"
        placeholder="Ange licensnyckel"
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        style={{ marginBottom: '10px', width: '300px', padding: '8px' }}
      />
      <br />
      <button onClick={handleActivate} style={{ padding: '8px 16px' }}>
        Aktivera
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default LicenseActivation;
