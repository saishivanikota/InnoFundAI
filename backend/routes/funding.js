import express from 'express';
import { query, get } from '../config/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Search and Filter Funding Opportunities
router.get('/', async (req, res) => {
  try {
    const {
      search,
      domain,
      country,
      minAmount,
      maxAmount,
      deadlineBefore,
      sort = 'funding_amount',
      order = 'DESC',
      page = 1,
      limit = 6
    } = req.query;

    let baseQuery = ' FROM funding_opportunities WHERE 1=1';
    const params = [];

    // Search filter (searches title, organization, description)
    if (search) {
      baseQuery += ' AND (title LIKE ? OR organization LIKE ? OR description LIKE ?)';
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard);
    }

    // Domain filter
    if (domain) {
      baseQuery += ' AND research_domain = ?';
      params.push(domain);
    }

    // Country filter
    if (country) {
      baseQuery += ' AND country = ?';
      params.push(country);
    }

    // Min Amount filter
    if (minAmount) {
      baseQuery += ' AND funding_amount >= ?';
      params.push(parseFloat(minAmount));
    }

    // Max Amount filter
    if (maxAmount) {
      baseQuery += ' AND funding_amount <= ?';
      params.push(parseFloat(maxAmount));
    }

    // Deadline filter
    if (deadlineBefore) {
      baseQuery += ' AND deadline <= ?';
      params.push(deadlineBefore);
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as count ${baseQuery}`;
    const countResult = await get(countSql, params);
    const totalCount = countResult ? countResult.count : 0;

    // Sorting (Allowlist to prevent SQL injection)
    const allowedSortFields = ['funding_amount', 'deadline', 'title', 'organization'];
    const finalSort = allowedSortFields.includes(sort) ? sort : 'funding_amount';
    const finalOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination limit & offset
    const finalPage = parseInt(page) || 1;
    const finalLimit = parseInt(limit) || 6;
    const offset = (finalPage - 1) * finalLimit;

    // Build final data query
    const dataSql = `SELECT * ${baseQuery} ORDER BY ${finalSort} ${finalOrder} LIMIT ? OFFSET ?`;
    const dataParams = [...params, finalLimit, offset];

    const opportunities = await query(dataSql, dataParams);

    // Get unique list of domains and countries for filter dropdowns
    const filtersMeta = await get('SELECT COUNT(DISTINCT research_domain) as domainCount, COUNT(DISTINCT country) as countryCount FROM funding_opportunities');
    const domainsList = await query('SELECT DISTINCT research_domain FROM funding_opportunities ORDER BY research_domain ASC');
    const countriesList = await query('SELECT DISTINCT country FROM funding_opportunities ORDER BY country ASC');

    return res.json({
      opportunities,
      pagination: {
        page: finalPage,
        limit: finalLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / finalLimit)
      },
      meta: {
        domains: domainsList.map(d => d.research_domain),
        countries: countriesList.map(c => c.country)
      }
    });
  } catch (error) {
    console.error('Error fetching funding:', error);
    return res.status(500).json({ error: 'Server error retrieving funding opportunities.' });
  }
});

// Domain-based Recommendations for Logged-In User
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    // 1. Fetch user's profile to retrieve domain
    const profile = await get('SELECT research_domain FROM profiles WHERE user_id = ?', [req.user.id]);
    
    if (!profile) {
      return res.status(404).json({
        code: 'PROFILE_NOT_FOUND',
        message: 'No research profile set. Please create a profile to get tailored recommendations.'
      });
    }

    const domain = profile.research_domain;

    // 2. Fetch funding opportunities matching domain
    // Limit to top 5 high-value opportunities matching the domain
    const recommendations = await query(
      'SELECT * FROM funding_opportunities WHERE research_domain = ? ORDER BY funding_amount DESC LIMIT 5',
      [domain]
    );

    return res.json({
      domain,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ error: 'Server error retrieving recommendations.' });
  }
});

export default router;
