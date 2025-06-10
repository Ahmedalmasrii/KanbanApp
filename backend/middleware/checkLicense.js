const License = require('../models/License');
const User = require('../models/User');

const checkLicense = async (req, res, next) => {
  // Läser licensnyckel från header eller body
  const licenseKey = req.headers['x-license-key'] || req.body.licenseKey;

  if (!licenseKey) {
    return res.status(400).json({ msg: 'Licensnyckel krävs.' });
  }

  const license = await License.findOne({ licenseKey });

  if (!license) {
    return res.status(401).json({ msg: 'Ogiltig licensnyckel.' });
  }

  if (!license.active) {
    return res.status(403).json({ msg: 'Licensen är inaktiverad.' });
  }

  if (new Date() > license.validUntil) {
    return res.status(403).json({ msg: 'Licensen har gått ut.' });
  }

  const userCount = await User.countDocuments({ company: license.companyName });
  if (userCount >= license.maxUsers) {
    return res.status(403).json({ msg: 'Användargräns har nåtts för denna licens.' });
  }

  req.license = license; // Lägg till licensinfo i request för senare användning
  next();
};

module.exports = checkLicense;
