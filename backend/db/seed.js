import { exec, run } from '../config/db.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Starting expanded database seeding (Weeks 3-7)...');

    // 1. Reset and Create Tables
    await exec(`
      DROP TABLE IF EXISTS ai_history;
      DROP TABLE IF EXISTS patents;
      DROP TABLE IF EXISTS research_trends;
      DROP TABLE IF EXISTS funding_opportunities;
      DROP TABLE IF EXISTS profiles;
      DROP TABLE IF EXISTS users;

      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'researcher',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        organization TEXT NOT NULL,
        research_domain TEXT NOT NULL,
        keywords TEXT NOT NULL,
        research_interests TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE funding_opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        research_domain TEXT NOT NULL,
        funding_amount REAL NOT NULL,
        deadline DATE NOT NULL,
        country TEXT NOT NULL,
        description TEXT NOT NULL,
        funding_type TEXT NOT NULL DEFAULT 'Grant',
        eligibility TEXT NOT NULL DEFAULT 'Academic Researchers',
        status TEXT NOT NULL DEFAULT 'Open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE research_trends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        research_domain TEXT NOT NULL,
        publication_count INTEGER NOT NULL,
        UNIQUE(year, research_domain)
      );

      CREATE TABLE patents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patent_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        technology_domain TEXT NOT NULL,
        inventor TEXT NOT NULL,
        country TEXT NOT NULL,
        year INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Granted'
      );

      CREATE TABLE ai_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    console.log('Tables created successfully.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const researcherPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    const researcherUser = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['sarah_j', 'sarah@domain.edu', researcherPassword, 'researcher']
    );

    await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin_user', 'admin@platform.com', adminPassword, 'admin']
    );

    console.log('Users seeded.');

    // 3. Seed Research Profile for Sarah
    await run(`
      INSERT INTO profiles (user_id, full_name, organization, research_domain, keywords, research_interests)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      researcherUser.id,
      'Dr. Sarah Jenkins',
      'Quantum & AI Institute, Tech University',
      'Artificial Intelligence',
      'AI, Machine Learning, Computer Vision, Deep Learning',
      'Exploring robust deep learning architectures for computer vision and generative models. Interested in cross-domain applications in medical image analysis and autonomous systems.'
    ]);

    console.log('Research Profile seeded.');

    // 4. Seed Funding Opportunities (20 opportunities with type, eligibility, status)
    const fundingData = [
      {
        title: 'Global AI Ethics and Algorithms Grant',
        organization: 'World Tech Foundation',
        research_domain: 'Artificial Intelligence',
        funding_amount: 250000,
        deadline: '2026-11-30',
        country: 'USA',
        description: 'Funding research that aims to evaluate and improve fairness, accountability, transparency, and safety in large language models and computer vision pipelines.',
        funding_type: 'Grant',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Deep Learning in Medical Imaging Award',
        organization: 'Health Science Council',
        research_domain: 'Artificial Intelligence',
        funding_amount: 600000,
        deadline: '2026-10-15',
        country: 'Germany',
        description: 'Supports advanced research applying convolutional neural networks and transformer models to MRI and CT scan analysis to improve diagnostic accuracy.',
        funding_type: 'Grant',
        eligibility: 'Postdocs',
        status: 'Open'
      },
      {
        title: 'Grid Decarbonization Technology Grant',
        organization: 'Sustainable Future Energy Alliance',
        research_domain: 'Renewable Energy',
        funding_amount: 1200000,
        deadline: '2026-09-01',
        country: 'Canada',
        description: 'Funding projects aimed at integrating solar, wind, and storage energy arrays into municipal grids using automated high-efficiency inverter designs.',
        funding_type: 'Grant',
        eligibility: 'SMEs & Corporates',
        status: 'Open'
      },
      {
        title: 'Quantum Key Distribution System Optimization',
        organization: 'Advanced Quantum Alliance',
        research_domain: 'Quantum Computing',
        funding_amount: 850000,
        deadline: '2026-12-15',
        country: 'UK',
        description: 'Aimed at optimizing key generation rates and transmission distances for quantum cryptography protocols in metropolitan optical fiber networks.',
        funding_type: 'Contract',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Zero-Trust Protocol Design for Cloud Infrastructure',
        organization: 'Cyber Defense Agency',
        research_domain: 'Cybersecurity',
        funding_amount: 450000,
        deadline: '2026-10-25',
        country: 'USA',
        description: 'Focuses on building robust, scalable cryptographic architectures for validating API endpoints and database permissions dynamically in hyper-scale cloud fabrics.',
        funding_type: 'Contract',
        eligibility: 'SMEs & Corporates',
        status: 'Open'
      },
      {
        title: 'Cardiovascular Genomic Analysis Grant',
        organization: 'National Heart & Biotech Institute',
        research_domain: 'Health Sciences',
        funding_amount: 950000,
        deadline: '2026-08-30',
        country: 'Japan',
        description: 'Funding genome-wide association studies (GWAS) aiming to identify genetic markers that predict susceptibility to arterial calcification.',
        funding_type: 'Grant',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Autonomous Drone Swarm Perception Research',
        organization: 'AeroTech Research Lab',
        research_domain: 'Artificial Intelligence',
        funding_amount: 320000,
        deadline: '2026-09-15',
        country: 'France',
        description: 'Focused on designing decentralized collaborative computer vision algorithms that allow multi-drone platforms to navigate mapping spaces without active GPS coordinates.',
        funding_type: 'Fellowship',
        eligibility: 'Postdocs',
        status: 'Open'
      },
      {
        title: 'Offshore Wind Turbine Array Simulation',
        organization: 'Global Marine Energy Group',
        research_domain: 'Renewable Energy',
        funding_amount: 780000,
        deadline: '2026-11-10',
        country: 'Denmark',
        description: 'Supports high-fidelity computational fluid dynamics (CFD) modeling of wake interaction and turbulence in deep-water offshore wind installations.',
        funding_type: 'Contract',
        eligibility: 'SMEs & Corporates',
        status: 'Open'
      },
      {
        title: 'Quantum Error Correction Coding Fellowships',
        organization: 'Niels Bohr Physics Institute',
        research_domain: 'Quantum Computing',
        funding_amount: 300000,
        deadline: '2026-08-15',
        country: 'Germany',
        description: 'Fellowship opportunities focusing on topological codes and surface code engineering to preserve coherence in superconducting qubit architectures.',
        funding_type: 'Fellowship',
        eligibility: 'PhD Students',
        status: 'Open'
      },
      {
        title: 'Advanced Solid-State Battery Chemistry Grant',
        organization: 'Automotive Innovation Consortium',
        research_domain: 'Renewable Energy',
        funding_amount: 1500000,
        deadline: '2027-01-15',
        country: 'Japan',
        description: 'Accelerating experimental research in silicon-based anodes and ceramic electrolyte interfaces to maximize volumetric density in electric vehicles.',
        funding_type: 'Grant',
        eligibility: 'SMEs & Corporates',
        status: 'Open'
      },
      {
        title: 'Edge AI Inference on Low-Power Platforms',
        organization: 'Semiconductor Innovation Alliance',
        research_domain: 'Artificial Intelligence',
        funding_amount: 400000,
        deadline: '2026-12-05',
        country: 'South Korea',
        description: 'Supports the optimization of model quantization, pruning, and neural search methods for deployable intelligence on ultra-low-wattage microcontrollers.',
        funding_type: 'Grant',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Biomimetic Neural Network Interfaces',
        organization: 'NeuroTech Global Alliance',
        research_domain: 'Health Sciences',
        funding_amount: 1100000,
        deadline: '2026-11-05',
        country: 'Switzerland',
        description: 'Supports interdisciplinary work in brain-computer interfaces (BCI) implementing real-time signal decoding to enable motor response restoration.',
        funding_type: 'Grant',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Post-Quantum Cryptography Standardization Program',
        organization: 'National Security Standards Office',
        research_domain: 'Cybersecurity',
        funding_amount: 500000,
        deadline: '2026-09-20',
        country: 'USA',
        description: 'Encouraging implementation testing and evaluation of lattice-based signature algorithms under heavy network packet load conditions.',
        funding_type: 'Contract',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'On-Demand Cancer Immunotherapy Customization',
        organization: 'Oncology Therapeutics Foundation',
        research_domain: 'Health Sciences',
        funding_amount: 1300000,
        deadline: '2026-12-20',
        country: 'France',
        description: 'Funding translational research for clinical evaluation of mRNA-based custom peptide vaccines targeting patient-specific tumor mutations.',
        funding_type: 'Grant',
        eligibility: 'Academic Researchers',
        status: 'Reviewing'
      },
      {
        title: 'Silicon Spin Qubit Control Architectures',
        organization: 'Global Quantum Alliance',
        research_domain: 'Quantum Computing',
        funding_amount: 900000,
        deadline: '2026-10-30',
        country: 'Australia',
        description: 'Focuses on precision microwave control lines and readout electronics for multi-dot silicon quantum computer modules.',
        funding_type: 'Contract',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Distributed Smart Meter IoT Protection',
        organization: 'Grid Security Coalition',
        research_domain: 'Cybersecurity',
        funding_amount: 350000,
        deadline: '2026-08-25',
        country: 'Canada',
        description: 'Designing lightweight anomaly detection models that reside on edge utility smart meters to intercept command injections.',
        funding_type: 'Grant',
        eligibility: 'PhD Students',
        status: 'Closed'
      },
      {
        title: 'Perovskite-Silicon Tandem Solar Cell Scaling',
        organization: 'Clean Future Trust',
        research_domain: 'Renewable Energy',
        funding_amount: 980000,
        deadline: '2026-09-25',
        country: 'Australia',
        description: 'Aimed at mitigating degradation caused by moisture, light, and heat in dual-junction solar cell configurations to exceed 30% operational efficiency.',
        funding_type: 'Grant',
        eligibility: 'SMEs & Corporates',
        status: 'Open'
      },
      {
        title: 'Explainable AI in Clinical Decision Support',
        organization: 'AI and Society Institute',
        research_domain: 'Artificial Intelligence',
        funding_amount: 280000,
        deadline: '2026-10-10',
        country: 'Sweden',
        description: 'Funding research that creates visual interpretation frameworks explaining neural network output for clinical practitioners during diagnosis.',
        funding_type: 'Fellowship',
        eligibility: 'Postdocs',
        status: 'Open'
      },
      {
        title: 'Microbiome-Brain Axis Therapeutics Development',
        organization: 'Advanced Health Institute',
        research_domain: 'Health Sciences',
        funding_amount: 850000,
        deadline: '2026-11-15',
        country: 'USA',
        description: 'Investigating systemic metabolic impacts of gut bacteria diversity on neurological health markers using cell and animal modeling.',
        funding_type: 'Grant',
        eligibility: 'Academic Researchers',
        status: 'Open'
      },
      {
        title: 'Hardware-in-the-Loop Intrusion Simulation',
        organization: 'Critical Infrastructure Lab',
        research_domain: 'Cybersecurity',
        funding_amount: 600000,
        deadline: '2026-12-10',
        country: 'UK',
        description: 'Funding testing of PLC devices using virtual twin simulations to replicate cyber-attacks on municipal water distribution setups.',
        funding_type: 'Contract',
        eligibility: 'SMEs & Corporates',
        status: 'Open'
      }
    ];

    for (const item of fundingData) {
      await run(`
        INSERT INTO funding_opportunities (title, organization, research_domain, funding_amount, deadline, country, description, funding_type, eligibility, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.title,
        item.organization,
        item.research_domain,
        item.funding_amount,
        item.deadline,
        item.country,
        item.description,
        item.funding_type,
        item.eligibility,
        item.status
      ]);
    }

    console.log('Funding opportunities seeded.');

    // 5. Seed Research Trends
    const domains = [
      'Artificial Intelligence',
      'Renewable Energy',
      'Quantum Computing',
      'Health Sciences',
      'Cybersecurity'
    ];

    const trendMatrix = {
      'Artificial Intelligence': [1200, 1800, 2500, 3800, 5200, 7100, 9500, 12500, 16000],
      'Renewable Energy': [900, 1100, 1400, 1800, 2300, 2900, 3700, 4800, 6000],
      'Quantum Computing': [150, 220, 310, 450, 680, 950, 1400, 2000, 2800],
      'Health Sciences': [3500, 3900, 4400, 5000, 5800, 6700, 7800, 9000, 10500],
      'Cybersecurity': [800, 1000, 1300, 1700, 2200, 2800, 3500, 4400, 5500]
    };

    const startYear = 2018;

    for (const domain of domains) {
      const yearlyCounts = trendMatrix[domain];
      for (let i = 0; i < yearlyCounts.length; i++) {
        const year = startYear + i;
        const count = yearlyCounts[i];
        await run(`
          INSERT INTO research_trends (year, research_domain, publication_count)
          VALUES (?, ?, ?)
        `, [year, domain, count]);
      }
    }

    console.log('Research trends seeded.');

    // 6. Seed Patents (15 records)
    const patentData = [
      {
        patent_id: 'US-11029431-B2',
        title: 'System and Method for Graph Neural Network Optimization in Autonomous Navigational Environments',
        organization: 'Google LLC',
        technology_domain: 'Artificial Intelligence',
        inventor: 'Dr. Arthur Vance, Dr. Lily Zhang',
        country: 'USA',
        year: 2024,
        status: 'Granted'
      },
      {
        patent_id: 'EP-3940192-A1',
        title: 'Bipolar Solid-State Electrolyte Interface for Lithium Polymer Cell Arrays',
        organization: 'Toyota Motor Corp',
        technology_domain: 'Renewable Energy',
        inventor: 'K. Takahashi, Y. Sato',
        country: 'Japan',
        year: 2023,
        status: 'Granted'
      },
      {
        patent_id: 'US-11304958-B1',
        title: 'Quantum Phase Estimation Error Mitigation via Topological Code Stabilizers',
        organization: 'IBM Corp',
        technology_domain: 'Quantum Computing',
        inventor: 'Sarah J. Jenkins, M. Nielsen',
        country: 'USA',
        year: 2025,
        status: 'Granted'
      },
      {
        patent_id: 'US-11204910-B2',
        title: 'Cryptographic Protocol for Secure Boundary Routing in Multi-Tenant Environments',
        organization: 'Amazon Technologies Inc',
        technology_domain: 'Cybersecurity',
        inventor: 'W. Vogels, Dr. R. Prasad',
        country: 'USA',
        year: 2022,
        status: 'Granted'
      },
      {
        patent_id: 'EP-4029104-A1',
        title: 'Biocompatible Microelectrode Array for Motor Cortical Signal Decoding',
        organization: 'Neuralink Corp',
        technology_domain: 'Health Sciences',
        inventor: 'E. Musk, Dr. D. Seo, J. Miller',
        country: 'Switzerland',
        year: 2024,
        status: 'Pending'
      },
      {
        patent_id: 'US-11492048-B2',
        title: 'Attention-Based Sequence Mapping for Real-time Translation Pipelines',
        organization: 'Meta Platforms Inc',
        technology_domain: 'Artificial Intelligence',
        inventor: 'Y. LeCun, Dr. S. Goyal',
        country: 'USA',
        year: 2024,
        status: 'Granted'
      },
      {
        patent_id: 'JP-20250104-A',
        title: 'Perovskite Tandem Photovoltaic Assembly with Co-extruded Protective Moisture Barriers',
        organization: 'Kyocera Corp',
        technology_domain: 'Renewable Energy',
        inventor: 'T. Nakamura, H. Tanaka',
        country: 'Japan',
        year: 2025,
        status: 'Pending'
      },
      {
        patent_id: 'EP-3891042-B1',
        title: 'Superconducting Qubit Control System using Cryogenic Microwave Switches',
        organization: 'Intel Corp',
        technology_domain: 'Quantum Computing',
        inventor: 'Dr. A. Vanderbeck, L. Rossi',
        country: 'Netherlands',
        year: 2023,
        status: 'Granted'
      },
      {
        patent_id: 'US-11504938-B2',
        title: 'IoT Endpoint Anomaly Interceptor implementing Low-Power Quantized Signatures',
        organization: 'Cisco Systems Inc',
        technology_domain: 'Cybersecurity',
        inventor: 'M. Patel, Dr. F. Dupont',
        country: 'Canada',
        year: 2024,
        status: 'Granted'
      },
      {
        patent_id: 'WO-2024-098231-A1',
        title: 'Microfluidic Peptide Synthesizer for Custom On-Demand mRNA Encapsulation',
        organization: 'Moderna Therapeutics',
        technology_domain: 'Health Sciences',
        inventor: 'U. Sahin, Dr. O. Badr',
        country: 'Germany',
        year: 2024,
        status: 'Pending'
      },
      {
        patent_id: 'US-11782390-B1',
        title: 'Contrastive Representation Learning for Semantic Edge Pruning in Autonomous Agents',
        organization: 'Tesla Inc',
        technology_domain: 'Artificial Intelligence',
        inventor: 'A. Karpathy, J. Doe',
        country: 'USA',
        year: 2025,
        status: 'Granted'
      },
      {
        patent_id: 'EP-4102941-A2',
        title: 'Wind Turbine Inverter Waveform Correction using Active Dynamic Resistors',
        organization: 'Vestas Wind Systems',
        technology_domain: 'Renewable Energy',
        inventor: 'M. Hansen, O. Nielsen',
        country: 'Denmark',
        year: 2022,
        status: 'Granted'
      },
      {
        patent_id: 'US-11002341-B2',
        title: 'Silicon-Based Spin Qubit Initialization via Rapid Thermal Readout Gates',
        organization: 'Silicon Quantum Computing Ltd',
        technology_domain: 'Quantum Computing',
        inventor: 'Michelle Simmons, A. Morello',
        country: 'Australia',
        year: 2021,
        status: 'Granted'
      },
      {
        patent_id: 'US-11604921-B2',
        title: 'Stateful Firewall Injection Filtering inside Distributed Smart Grid Networks',
        organization: 'Siemens AG',
        technology_domain: 'Cybersecurity',
        inventor: 'G. Weber, H. Wagner',
        country: 'Germany',
        year: 2023,
        status: 'Granted'
      },
      {
        patent_id: 'EP-3789042-B1',
        title: 'Gene Sequencing Read Classifier Utilizing Local Hashing Functions',
        organization: 'Illumina Inc',
        technology_domain: 'Health Sciences',
        inventor: 'Dr. C. Flatley, S. Cooper',
        country: 'UK',
        year: 2020,
        status: 'Expired'
      }
    ];

    for (const item of patentData) {
      await run(`
        INSERT INTO patents (patent_id, title, organization, technology_domain, inventor, country, year, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.patent_id,
        item.title,
        item.organization,
        item.technology_domain,
        item.inventor,
        item.country,
        item.year,
        item.status
      ]);
    }

    console.log('Patents seeded.');
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
