const db = require('../config/db');
const { getSuggestionForCategory, SMART_SUGGESTIONS } = require('../utils/smartSuggestions');

/**
 * Get all services in the catalog
 */
const getServices = async (req, res, next) => {
  try {
    const [services] = await db.query('SELECT * FROM services ORDER BY id ASC');
    return res.json({
      success: true,
      services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Smart Breakdown Suggestion for a specific problem category
 */
const getSmartSuggestions = async (req, res, next) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.json({
        success: true,
        allSuggestions: SMART_SUGGESTIONS
      });
    }

    const suggestion = getSuggestionForCategory(category);
    return res.json({
      success: true,
      category,
      suggestion
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getSmartSuggestions
};
