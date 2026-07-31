import express from 'express';
import { get, query } from '../config/db.js';

const router = express.Router();

// Retrieve combined summary metrics and pre-computed dashboard chart datasets
router.get('/stats', async (req, res) => {
  try {
    // 1. Core Summary Metrics
    const userCount = await get("SELECT COUNT(*) as count FROM users WHERE role = 'researcher'");
    const profileCount = await get("SELECT COUNT(*) as count FROM profiles");
    const fundingCount = await get("SELECT COUNT(*) as count FROM funding_opportunities");
    const domainCount = await get("SELECT COUNT(DISTINCT research_domain) as count FROM funding_opportunities");
    const totalPubs = await get("SELECT SUM(publication_count) as count FROM research_trends");

    const summary = {
      totalResearchers: profileCount ? profileCount.count : 0,
      totalRegisteredUsers: userCount ? userCount.count : 0,
      fundingOpportunities: fundingCount ? fundingCount.count : 0,
      uniqueDomains: domainCount ? domainCount.count : 0,
      totalPublications: totalPubs ? totalPubs.count : 0
    };

    // 2. Funding Distribution (Total funding budget per research domain)
    const fundingDistribution = await query(`
      SELECT research_domain as domain, SUM(funding_amount) as totalFunding, COUNT(*) as opportunityCount
      FROM funding_opportunities
      GROUP BY research_domain
      ORDER BY totalFunding DESC
    `);

    // 3. Publications by Domain (For the latest recorded year)
    const latestYearRow = await get("SELECT MAX(year) as maxYear FROM research_trends");
    const latestYear = latestYearRow ? latestYearRow.maxYear : 2026;
    
    const publicationsByDomain = await query(`
      SELECT research_domain as domain, publication_count as publications
      FROM research_trends
      WHERE year = ?
      ORDER BY publications DESC
    `, [latestYear]);

    // 4. Research Growth Over Time (Total publication sum aggregated by year)
    const researchGrowth = await query(`
      SELECT year, SUM(publication_count) as totalPublications
      FROM research_trends
      GROUP BY year
      ORDER BY year ASC
    `);

    return res.json({
      summary,
      fundingDistribution,
      publicationsByDomain,
      researchGrowth,
      metadata: {
        latestYear
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({ error: 'Server error retrieving dashboard statistics.' });
  }
});

export default router;
