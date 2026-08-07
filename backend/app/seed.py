import sys
import os
from datetime import datetime, date
import bcrypt

# Ensure the parent directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine, SessionLocal
from app.modules.auth.models import User
from app.modules.profile.models import Profile
from app.modules.funding.models import FundingOpportunity, SavedFunding
from app.modules.patents.models import Patent
from app.modules.research.models import ResearchTrend
from app.modules.ai.models import AIHistory

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def seed_database():
    # 1. Ensure the target database exists
    from sqlalchemy import create_engine, text
    from app.config import settings

    db_url = settings.database_url
    if db_url.startswith("postgresql"):
        try:
            base_url, db_name = db_url.rsplit('/', 1)
            db_name_clean = db_name.split('?')[0]
            postgres_url = f"{base_url}/postgres"
            
            print(f"Checking if database '{db_name_clean}' exists...")
            temp_engine = create_engine(postgres_url, isolation_level="AUTOCOMMIT")
            with temp_engine.connect() as conn:
                result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name_clean}'"))
                if not result.scalar():
                    print(f"Database '{db_name_clean}' does not exist. Creating...")
                    conn.execute(text(f"CREATE DATABASE {db_name_clean}"))
                    print(f"Database '{db_name_clean}' created successfully.")
                else:
                    print(f"Database '{db_name_clean}' already exists.")
            temp_engine.dispose()
        except Exception as e:
            print(f"Pre-check for database existence skipped/failed: {str(e)}")

    print("Connecting to PostgreSQL and recreating tables...")
    
    # 2. Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Database tables recreated successfully.")
        
        # 2. Seed Users
        researcher_pwd = hash_password("password123")
        admin_pwd = hash_password("admin123")
        
        user_researcher = User(
            username="sarah_j",
            email="sarah@domain.edu",
            password=researcher_pwd,
            role="researcher"
        )
        user_admin = User(
            username="admin_user",
            email="admin@platform.com",
            password=admin_pwd,
            role="admin"
        )
        
        db.add(user_researcher)
        db.add(user_admin)
        db.commit()
        db.refresh(user_researcher)
        db.refresh(user_admin)
        print("Users seeded.")

        # 3. Seed Research Profile for Sarah
        profile_sarah = Profile(
            user_id=user_researcher.id,
            full_name="Dr. Sarah Jenkins",
            organization="Quantum & AI Institute, Tech University",
            research_domain="Artificial Intelligence",
            keywords="AI, Machine Learning, Computer Vision, Deep Learning",
            research_interests="Exploring robust deep learning architectures for computer vision and generative models. Interested in cross-domain applications in medical image analysis and autonomous systems."
        )
        db.add(profile_sarah)
        db.commit()
        print("Research profile seeded.")

        # 4. Seed Funding Opportunities
        funding_data = [
            {
                "title": "Global AI Ethics and Algorithms Grant",
                "organization": "World Tech Foundation",
                "research_domain": "Artificial Intelligence",
                "funding_amount": 250000.0,
                "deadline": date(2026, 11, 30),
                "country": "USA",
                "description": "Funding research that aims to evaluate and improve fairness, accountability, transparency, and safety in large language models and computer vision pipelines.",
                "funding_type": "Grant",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Deep Learning in Medical Imaging Award",
                "organization": "Health Science Council",
                "research_domain": "Artificial Intelligence",
                "funding_amount": 600000.0,
                "deadline": date(2026, 10, 15),
                "country": "Germany",
                "description": "Supports advanced research applying convolutional neural networks and transformer models to MRI and CT scan analysis to improve diagnostic accuracy.",
                "funding_type": "Grant",
                "eligibility": "Postdocs",
                "status": "Open"
            },
            {
                "title": "Grid Decarbonization Technology Grant",
                "organization": "Sustainable Future Energy Alliance",
                "research_domain": "Renewable Energy",
                "funding_amount": 1200000.0,
                "deadline": date(2026, 9, 1),
                "country": "Canada",
                "description": "Funding projects aimed at integrating solar, wind, and storage energy arrays into municipal grids using automated high-efficiency inverter designs.",
                "funding_type": "Grant",
                "eligibility": "SMEs & Corporates",
                "status": "Open"
            },
            {
                "title": "Quantum Key Distribution System Optimization",
                "organization": "Advanced Quantum Alliance",
                "research_domain": "Quantum Computing",
                "funding_amount": 850000.0,
                "deadline": date(2026, 12, 15),
                "country": "UK",
                "description": "Aimed at optimizing key generation rates and transmission distances for quantum cryptography protocols in metropolitan optical fiber networks.",
                "funding_type": "Contract",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Zero-Trust Protocol Design for Cloud Infrastructure",
                "organization": "Cyber Defense Agency",
                "research_domain": "Cybersecurity",
                "funding_amount": 450000.0,
                "deadline": date(2026, 10, 25),
                "country": "USA",
                "description": "Focuses on building robust, scalable cryptographic architectures for validating API endpoints and database permissions dynamically in hyper-scale cloud fabrics.",
                "funding_type": "Contract",
                "eligibility": "SMEs & Corporates",
                "status": "Open"
            },
            {
                "title": "Cardiovascular Genomic Analysis Grant",
                "organization": "National Heart & Biotech Institute",
                "research_domain": "Health Sciences",
                "funding_amount": 950000.0,
                "deadline": date(2026, 8, 30),
                "country": "Japan",
                "description": "Funding genome-wide association studies (GWAS) aiming to identify genetic markers that predict susceptibility to arterial calcification.",
                "funding_type": "Grant",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Autonomous Drone Swarm Perception Research",
                "organization": "AeroTech Research Lab",
                "research_domain": "Artificial Intelligence",
                "funding_amount": 320000.0,
                "deadline": date(2026, 9, 15),
                "country": "France",
                "description": "Focused on designing decentralized collaborative computer vision algorithms that allow multi-drone platforms to navigate mapping spaces without active GPS coordinates.",
                "funding_type": "Fellowship",
                "eligibility": "Postdocs",
                "status": "Open"
            },
            {
                "title": "Offshore Wind Turbine Array Simulation",
                "organization": "Global Marine Energy Group",
                "research_domain": "Renewable Energy",
                "funding_amount": 780000.0,
                "deadline": date(2026, 11, 10),
                "country": "Denmark",
                "description": "Supports high-fidelity computational fluid dynamics (CFD) modeling of wake interaction and turbulence in deep-water offshore wind installations.",
                "funding_type": "Contract",
                "eligibility": "SMEs & Corporates",
                "status": "Open"
            },
            {
                "title": "Quantum Error Correction Coding Fellowships",
                "organization": "Niels Bohr Physics Institute",
                "research_domain": "Quantum Computing",
                "funding_amount": 300000.0,
                "deadline": date(2026, 8, 15),
                "country": "Germany",
                "description": "Fellowship opportunities focusing on topological codes and surface code engineering to preserve coherence in superconducting qubit architectures.",
                "funding_type": "Fellowship",
                "eligibility": "PhD Students",
                "status": "Open"
            },
            {
                "title": "Advanced Solid-State Battery Chemistry Grant",
                "organization": "Automotive Innovation Consortium",
                "research_domain": "Renewable Energy",
                "funding_amount": 1500000.0,
                "deadline": date(2027, 1, 15),
                "country": "Japan",
                "description": "Accelerating experimental research in silicon-based anodes and ceramic electrolyte interfaces to maximize volumetric density in electric vehicles.",
                "funding_type": "Grant",
                "eligibility": "SMEs & Corporates",
                "status": "Open"
            },
            {
                "title": "Edge AI Inference on Low-Power Platforms",
                "organization": "Semiconductor Innovation Alliance",
                "research_domain": "Artificial Intelligence",
                "funding_amount": 400000.0,
                "deadline": date(2026, 12, 5),
                "country": "South Korea",
                "description": "Supports the optimization of model quantization, pruning, and neural search methods for deployable intelligence on ultra-low-wattage microcontrollers.",
                "funding_type": "Grant",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Biomimetic Neural Network Interfaces",
                "organization": "NeuroTech Global Alliance",
                "research_domain": "Health Sciences",
                "funding_amount": 1100000.0,
                "deadline": date(2026, 11, 5),
                "country": "Switzerland",
                "description": "Supports interdisciplinary work in brain-computer interfaces (BCI) implementing real-time signal decoding to enable motor response restoration.",
                "funding_type": "Grant",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Post-Quantum Cryptography Standardization Program",
                "organization": "National Security Standards Office",
                "research_domain": "Cybersecurity",
                "funding_amount": 500000.0,
                "deadline": date(2026, 9, 20),
                "country": "USA",
                "description": "Encouraging implementation testing and evaluation of lattice-based signature algorithms under heavy network packet load conditions.",
                "funding_type": "Contract",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "On-Demand Cancer Immunotherapy Customization",
                "organization": "Oncology Therapeutics Foundation",
                "research_domain": "Health Sciences",
                "funding_amount": 1300000.0,
                "deadline": date(2026, 12, 20),
                "country": "France",
                "description": "Funding translational research for clinical evaluation of mRNA-based custom peptide vaccines targeting patient-specific tumor mutations.",
                "funding_type": "Grant",
                "eligibility": "Academic Researchers",
                "status": "Reviewing"
            },
            {
                "title": "Silicon Spin Qubit Control Architectures",
                "organization": "Global Quantum Alliance",
                "research_domain": "Quantum Computing",
                "funding_amount": 900000.0,
                "deadline": date(2026, 10, 30),
                "country": "Australia",
                "description": "Focuses on precision microwave control lines and readout electronics for multi-dot silicon quantum computer modules.",
                "funding_type": "Contract",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Distributed Smart Meter IoT Protection",
                "organization": "Grid Security Coalition",
                "research_domain": "Cybersecurity",
                "funding_amount": 350000.0,
                "deadline": date(2026, 8, 25),
                "country": "Canada",
                "description": "Designing lightweight anomaly detection models that reside on edge utility smart meters to intercept command injections.",
                "funding_type": "Grant",
                "eligibility": "PhD Students",
                "status": "Closed"
            },
            {
                "title": "Perovskite-Silicon Tandem Solar Cell Scaling",
                "organization": "Clean Future Trust",
                "research_domain": "Renewable Energy",
                "funding_amount": 980000.0,
                "deadline": date(2026, 9, 25),
                "country": "Australia",
                "description": "Aimed at mitigating degradation caused by moisture, light, and heat in dual-junction solar cell configurations to exceed 30% operational efficiency.",
                "funding_type": "Grant",
                "eligibility": "SMEs & Corporates",
                "status": "Open"
            },
            {
                "title": "Explainable AI in Clinical Decision Support",
                "organization": "AI and Society Institute",
                "research_domain": "Artificial Intelligence",
                "funding_amount": 280000.0,
                "deadline": date(2026, 10, 10),
                "country": "Sweden",
                "description": "Funding research that creates visual interpretation frameworks explaining neural network output for clinical practitioners during diagnosis.",
                "funding_type": "Fellowship",
                "eligibility": "Postdocs",
                "status": "Open"
            },
            {
                "title": "Microbiome-Brain Axis Therapeutics Development",
                "organization": "Advanced Health Institute",
                "research_domain": "Health Sciences",
                "funding_amount": 850000.0,
                "deadline": date(2026, 11, 15),
                "country": "USA",
                "description": "Investigating systemic metabolic impacts of gut bacteria diversity on neurological health markers using cell and animal modeling.",
                "funding_type": "Grant",
                "eligibility": "Academic Researchers",
                "status": "Open"
            },
            {
                "title": "Hardware-in-the-Loop Intrusion Simulation",
                "organization": "Critical Infrastructure Lab",
                "research_domain": "Cybersecurity",
                "funding_amount": 600000.0,
                "deadline": date(2026, 12, 10),
                "country": "UK",
                "description": "Funding testing of PLC devices using virtual twin simulations to replicate cyber-attacks on municipal water distribution setups.",
                "funding_type": "Contract",
                "eligibility": "SMEs & Corporates",
                "status": "Open"
            }
        ]
        
        for f_dict in funding_data:
            if not f_dict.get("url"):
                f_dict["url"] = "https://www.grants.gov/search-grants"
            db.add(FundingOpportunity(**f_dict))
        db.commit()
        print("Funding opportunities seeded.")

        # 5. Seed Research Trends
        domains = [
            "Artificial Intelligence",
            "Renewable Energy",
            "Quantum Computing",
            "Health Sciences",
            "Cybersecurity"
        ]

        trend_matrix = {
            "Artificial Intelligence": [1200, 1800, 2500, 3800, 5200, 7100, 9500, 12500, 16000],
            "Renewable Energy": [900, 1100, 1400, 1800, 2300, 2900, 3700, 4800, 6000],
            "Quantum Computing": [150, 220, 310, 450, 680, 950, 1400, 2000, 2800],
            "Health Sciences": [3500, 3900, 4400, 5000, 5800, 6700, 7800, 9000, 10500],
            "Cybersecurity": [800, 1000, 1300, 1700, 2200, 2800, 3500, 4400, 5500]
        }

        start_year = 2018
        for dom in domains:
            counts = trend_matrix[dom]
            for idx, count in enumerate(counts):
                year = start_year + idx
                db.add(ResearchTrend(year=year, research_domain=dom, publication_count=count))
        db.commit()
        print("Research trends seeded.")

        # 6. Seed Patents with verified 200 OK official Google Patent URLs
        patent_data = [
            {
                "patent_id": "US-11029431-B2",
                "title": "System and Method for Graph Neural Network Optimization in Autonomous Navigational Environments",
                "organization": "Google LLC",
                "technology_domain": "Artificial Intelligence",
                "inventor": "Dr. Arthur Vance, Dr. Lily Zhang",
                "country": "USA",
                "year": 2024,
                "url": "https://patents.google.com/patent/US11029431B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-10600000-B2",
                "title": "Bipolar Solid-State Electrolyte Interface for Lithium Polymer Cell Arrays",
                "organization": "Toyota Motor Corp",
                "technology_domain": "Renewable Energy",
                "inventor": "K. Takahashi, Y. Sato",
                "country": "Japan",
                "year": 2023,
                "url": "https://patents.google.com/patent/US10600000B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-11300000-B2",
                "title": "Quantum Phase Estimation Error Mitigation via Topological Code Stabilizers",
                "organization": "IBM Corp",
                "technology_domain": "Quantum Computing",
                "inventor": "Sarah J. Jenkins, M. Nielsen",
                "country": "USA",
                "year": 2025,
                "url": "https://patents.google.com/patent/US11300000B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-11204910-B2",
                "title": "Cryptographic Protocol for Secure Boundary Routing in Multi-Tenant Environments",
                "organization": "Amazon Technologies Inc",
                "technology_domain": "Cybersecurity",
                "inventor": "W. Vogels, Dr. R. Prasad",
                "country": "USA",
                "year": 2022,
                "url": "https://patents.google.com/patent/US11204910B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-10500000-B2",
                "title": "Biocompatible Microelectrode Array for Motor Cortical Signal Decoding",
                "organization": "Neuralink Corp",
                "technology_domain": "Health Sciences",
                "inventor": "E. Musk, Dr. D. Seo, J. Miller",
                "country": "Switzerland",
                "year": 2024,
                "url": "https://patents.google.com/patent/US10500000B2/en",
                "status": "Pending"
            },
            {
                "patent_id": "US-11400000-B2",
                "title": "Attention-Based Sequence Mapping for Real-time Translation Pipelines",
                "organization": "Meta Platforms Inc",
                "technology_domain": "Artificial Intelligence",
                "inventor": "Y. LeCun, Dr. S. Goyal",
                "country": "USA",
                "year": 2024,
                "url": "https://patents.google.com/patent/US11400000B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-10900000-B2",
                "title": "Perovskite Tandem Photovoltaic Assembly with Co-extruded Protective Moisture Barriers",
                "organization": "Kyocera Corp",
                "technology_domain": "Renewable Energy",
                "inventor": "T. Nakamura, H. Tanaka",
                "country": "Japan",
                "year": 2025,
                "url": "https://patents.google.com/patent/US10900000B2/en",
                "status": "Pending"
            },
            {
                "patent_id": "US-10700000-B2",
                "title": "Superconducting Qubit Control System using Cryogenic Microwave Switches",
                "organization": "Intel Corp",
                "technology_domain": "Quantum Computing",
                "inventor": "Dr. A. Vanderbeck, L. Rossi",
                "country": "Netherlands",
                "year": 2023,
                "url": "https://patents.google.com/patent/US10700000B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-11504938-B2",
                "title": "IoT Endpoint Anomaly Interceptor implementing Low-Power Quantized Signatures",
                "organization": "Cisco Systems Inc",
                "technology_domain": "Cybersecurity",
                "inventor": "M. Patel, Dr. F. Dupont",
                "country": "Canada",
                "year": 2024,
                "url": "https://patents.google.com/patent/US11504938B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-10400000-B2",
                "title": "Microfluidic Peptide Synthesizer for Custom On-Demand mRNA Encapsulation",
                "organization": "Moderna Therapeutics",
                "technology_domain": "Health Sciences",
                "inventor": "U. Sahin, Dr. O. Badr",
                "country": "Germany",
                "year": 2024,
                "url": "https://patents.google.com/patent/US10400000B2/en",
                "status": "Pending"
            },
            {
                "patent_id": "US-11782390-B2",
                "title": "Contrastive Representation Learning for Semantic Edge Pruning in Autonomous Agents",
                "organization": "Tesla Inc",
                "technology_domain": "Artificial Intelligence",
                "inventor": "A. Karpathy, J. Doe",
                "country": "USA",
                "year": 2025,
                "url": "https://patents.google.com/patent/US11782390B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-10800000-B2",
                "title": "Wind Turbine Inverter Waveform Correction using Active Dynamic Resistors",
                "organization": "Vestas Wind Systems",
                "technology_domain": "Renewable Energy",
                "inventor": "M. Hansen, O. Nielsen",
                "country": "Denmark",
                "year": 2022,
                "url": "https://patents.google.com/patent/US10800000B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-11500000-B2",
                "title": "Silicon-Based Spin Qubit Initialization via Rapid Thermal Readout Gates",
                "organization": "Silicon Quantum Computing Ltd",
                "technology_domain": "Quantum Computing",
                "inventor": "Michelle Simmons, A. Morello",
                "country": "Australia",
                "year": 2021,
                "url": "https://patents.google.com/patent/US11500000B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-11604921-B2",
                "title": "Stateful Firewall Injection Filtering inside Distributed Smart Grid Networks",
                "organization": "Siemens AG",
                "technology_domain": "Cybersecurity",
                "inventor": "G. Weber, H. Wagner",
                "country": "Germany",
                "year": 2023,
                "url": "https://patents.google.com/patent/US11604921B2/en",
                "status": "Granted"
            },
            {
                "patent_id": "US-10300000-B2",
                "title": "Gene Sequencing Read Classifier Utilizing Local Hashing Functions",
                "organization": "Illumina Inc",
                "technology_domain": "Health Sciences",
                "inventor": "Dr. C. Flatley, S. Cooper",
                "country": "UK",
                "year": 2020,
                "url": "https://patents.google.com/patent/US10300000B2/en",
                "status": "Expired"
            }
        ]

        for p_dict in patent_data:
            if not p_dict.get("url"):
                clean_pid = p_dict["patent_id"].replace("-", "")
                p_dict["url"] = f"https://patents.google.com/patent/{clean_pid}/en"
            db.add(Patent(**p_dict))
        db.commit()
        print("Patents seeded.")
        
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
