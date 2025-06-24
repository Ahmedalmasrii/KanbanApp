const License = require('../models/License');
const User = require('../models/User');

const checkLicense = async (req, res, next) => {
  const licenseKey = req.headers['x-license-key'] || req.body.licenseKey;
  const currentPath = req.headers.referer?.split('/')[3] || ''; // t.ex. 'c3' från http://localhost:3000/c3

  if (!licenseKey) {
    return res.status(400).json({ msg: 'Licensnyckel krävs.' });
  }

  try {
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

    if (license.urlPath.replace('/', '') !== currentPath) {
      return res.status(403).json({ msg: 'Licensnyckeln är inte giltig för denna länk.' });
    }

    const userCount = await User.countDocuments({ companyName: license.companyName });
    if (userCount >= license.maxUsers) {
      return res.status(403).json({ msg: 'Användargräns har nåtts för denna licens.' });
    }

    req.license = license;
    next();
  } catch (err) {
    console.error('Fel vid licenskontroll:', err);
    res.status(500).json({ msg: 'Serverfel vid licenskontroll.' });
  }
};

module.exports = checkLicense;
