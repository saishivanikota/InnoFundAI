import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Retrieve all research trends and formatted chart payloads
router.get('/', async (req, res) => {
  try {
    // 1. Fetch raw database records
    const rawTrends = await query(`
      SELECT year, research_domain, publication_count 
      FROM research_trends 
      ORDER BY year ASC, research_domain ASC
    `);

    // 2. Pivot data by year for line/bar charts (e.g. [{ year: 2018, 'Artificial Intelligence': 1200, 'Renewable Energy': 900, ... }])
    const yearPivotMap = {};
    const domainsSet = new Set();

    rawTrends.forEach(row => {
      const { year, research_domain, publication_count } = row;
      domainsSet.add(research_domain);

      if (!yearPivotMap[year]) {
        yearPivotMap[year] = { year };
      }
      yearPivotMap[year][research_domain] = publication_count;
    });

    const chartData = Object.values(yearPivotMap).sort((a, b) => a.year - b.year);
    const domains = Array.from(domainsSet);

    // 3. Compute growth analytics and summary stats for each domain
    const analytics = [];

    for (const domain of domains) {
      const domainRecords = rawTrends.filter(r => r.research_domain === domain);
      
      if (domainRecords.length > 0) {
        const startRecord = domainRecords[0]; // oldest (e.g., 2018)
        const endRecord = domainRecords[domainRecords.length - 1]; // latest (e.g., 2026)
        
        const totalPubs = domainRecords.reduce((sum, r) => sum + r.publication_count, 0);
        const averagePubs = Math.round(totalPubs / domainRecords.length);
        
        // Cumulative Growth percentage
        const growthRate = startRecord.publication_count > 0 
          ? (((endRecord.publication_count - startRecord.publication_count) / startRecord.publication_count) * 100).toFixed(1)
          : 0;

        analytics.push({
          domain,
          totalPublications: totalPubs,
          averagePublications: averagePubs,
          startCount: startRecord.publication_count,
          endCount: endRecord.publication_count,
          growthRate: parseFloat(growthRate) // e.g. 1233.3 %
        });
      }
    }

    return res.json({
      domains,
      chartData,
      analytics,
      rawTrends
    });
  } catch (error) {
    console.error('Error fetching trend analytics:', error);
    return res.status(500).json({ error: 'Server error retrieving research trends.' });
  }
});

export default router;
