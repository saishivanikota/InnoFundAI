import express from 'express';
import { query, get } from '../config/db.js';

const router = express.Router();

// GET /api/patents — paginated search with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      domain,
      status,
      country,
      year,
      sort = 'year',
      order = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    let baseQuery = ' FROM patents WHERE 1=1';
    const params = [];

    if (search) {
      baseQuery += ' AND (title LIKE ? OR organization LIKE ? OR inventor LIKE ? OR patent_id LIKE ?)';
      const w = `%${search}%`;
      params.push(w, w, w, w);
    }
    if (domain) { baseQuery += ' AND technology_domain = ?'; params.push(domain); }
    if (status) { baseQuery += ' AND status = ?'; params.push(status); }
    if (country) { baseQuery += ' AND country = ?'; params.push(country); }
    if (year) { baseQuery += ' AND year = ?'; params.push(parseInt(year)); }

    const countResult = await get(`SELECT COUNT(*) as count ${baseQuery}`, params);
    const totalCount = countResult?.count || 0;

    const allowed = ['year', 'title', 'organization', 'status'];
    const finalSort = allowed.includes(sort) ? sort : 'year';
    const finalOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const finalPage = parseInt(page) || 1;
    const finalLimit = parseInt(limit) || 10;
    const offset = (finalPage - 1) * finalLimit;

    const patents = await query(
      `SELECT * ${baseQuery} ORDER BY ${finalSort} ${finalOrder} LIMIT ? OFFSET ?`,
      [...params, finalLimit, offset]
    );

    const domains = await query('SELECT DISTINCT technology_domain FROM patents ORDER BY technology_domain ASC');
    const countries = await query('SELECT DISTINCT country FROM patents ORDER BY country ASC');
    const statuses = await query('SELECT DISTINCT status FROM patents ORDER BY status ASC');
    const years = await query('SELECT DISTINCT year FROM patents ORDER BY year DESC');

    return res.json({
      patents,
      pagination: { page: finalPage, limit: finalLimit, totalCount, totalPages: Math.ceil(totalCount / finalLimit) },
      meta: {
        domains: domains.map(d => d.technology_domain),
        countries: countries.map(c => c.country),
        statuses: statuses.map(s => s.status),
        years: years.map(y => y.year)
      }
    });
  } catch (error) {
    console.error('Error fetching patents:', error);
    return res.status(500).json({ error: 'Server error retrieving patents.' });
  }
});

// GET /api/patents/stats — analytics breakdown for charts
router.get('/stats', async (req, res) => {
  try {
    const byDomain = await query(`
      SELECT technology_domain as domain, COUNT(*) as count
      FROM patents GROUP BY technology_domain ORDER BY count DESC
    `);

    const byYear = await query(`
      SELECT year, COUNT(*) as count
      FROM patents GROUP BY year ORDER BY year ASC
    `);

    const byStatus = await query(`
      SELECT status, COUNT(*) as count
      FROM patents GROUP BY status ORDER BY count DESC
    `);

    const topOrgs = await query(`
      SELECT organization, COUNT(*) as count
      FROM patents GROUP BY organization ORDER BY count DESC LIMIT 8
    `);

    const total = await get('SELECT COUNT(*) as count FROM patents');
    const granted = await get("SELECT COUNT(*) as count FROM patents WHERE status = 'Granted'");
    const pending = await get("SELECT COUNT(*) as count FROM patents WHERE status = 'Pending'");

    return res.json({
      summary: {
        total: total?.count || 0,
        granted: granted?.count || 0,
        pending: pending?.count || 0
      },
      byDomain,
      byYear,
      byStatus,
      topOrgs
    });
  } catch (error) {
    console.error('Error fetching patent stats:', error);
    return res.status(500).json({ error: 'Server error retrieving patent statistics.' });
  }
});

// GET /api/patents/:id — single patent detail
router.get('/:id', async (req, res) => {
  try {
    const patent = await get('SELECT * FROM patents WHERE id = ?', [req.params.id]);
    if (!patent) return res.status(404).json({ error: 'Patent not found.' });
    return res.json(patent);
  } catch (error) {
    console.error('Error fetching patent:', error);
    return res.status(500).json({ error: 'Server error retrieving patent.' });
  }
});

export default router;
