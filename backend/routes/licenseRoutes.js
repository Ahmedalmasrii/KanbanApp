const express = require('express');
const router = express.Router();
const License = require('../models/License');

// Aktivera licens
router.post('/activate', async (req, res) => {
  const { licenseKey, companyName } = req.body;

  if (!licenseKey || !companyName) {
    return res.status(400).json({ msg: 'Licensnyckel och företagsnamn krävs.' });
  }

  try {
    // Kolla om företaget redan har en licensnyckel
    const existingLicense = await License.findOne({ companyName });

    if (existingLicense && existingLicense.licenseKey !== licenseKey) {
      return res.status(400).json({ msg: 'Det finns redan en licens registrerad för detta företag.' });
    }

    const license = await License.findOne({ licenseKey, companyName });

    if (!license) {
      return res.status(400).json({ msg: 'Ogiltig licensnyckel eller företagsnamn.' });
    }

    if (!license.active) {
      return res.status(400).json({ msg: 'Licensen är inaktiverad.' });
    }

    if (new Date() > license.validUntil) {
      return res.status(400).json({ msg: 'Licensen har gått ut.' });
    }

    res.status(200).json({ msg: 'Licensen är aktiverad!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Serverfel vid aktivering av licens.' });
  }
});

// Verifiera licens
router.post('/verify', async (req, res) => {
  const { licenseKey, companyName } = req.body;

  if (!licenseKey || !companyName) {
    return res.status(400).json({ valid: false, msg: 'Licensnyckel och företagsnamn krävs.' });
  }

  try {
    const license = await License.findOne({ licenseKey, companyName });

    if (!license) {
      return res.status(400).json({ valid: false, msg: 'Ogiltig licensnyckel eller företagsnamn.' });
    }

    if (!license.active) {
      return res.status(400).json({ valid: false, msg: 'Licensen är inaktiverad.' });
    }

    if (new Date() > license.validUntil) {
      return res.status(400).json({ valid: false, msg: 'Licensen har gått ut.' });
    }

    res.status(200).json({ valid: true, msg: 'Licensen är giltig.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, msg: 'Serverfel vid verifiering.' });
  }
});

module.exports = router;
