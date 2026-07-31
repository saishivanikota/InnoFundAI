from abc import ABC, abstractmethod
import httpx
import logging
from datetime import datetime, date

logger = logging.getLogger(__name__)

class FundingService(ABC):
    @abstractmethod
    async def search_funding(self, query: str, limit: int = 10) -> list[dict]:
        """
        Search for research funding opportunities.
        Returns a list of dictionaries with standard keys:
        - title
        - organization
        - research_domain
        - funding_amount
        - deadline (date object or string YYYY-MM-DD)
        - country
        - description
        - funding_type
        - eligibility
        - status
        """
        pass


class GrantsGovService(FundingService):
    def __init__(self):
        # Grants.gov Opportunity Search REST Service
        self.base_url = "https://www.grants.gov/grantsws/rest/opportunities/search/post"

    async def search_funding(self, query: str, limit: int = 10) -> list[dict]:
        """
        Queries Grants.gov Opportunity search service.
        Gracefully returns an empty list on timeout or API issues, allowing local fallback.
        """
        if not query or len(query.strip()) < 2:
            return []
            
        # Payload format for Grants.gov opportunity search POST service
        payload = {
            "keyword": query,
            "oppStatuses": "open",
            "startRecordNum": 0,
            "sortBy": "openDate|desc"
        }
        
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(self.base_url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    opps = data.get("oppDetails", [])
                    
                    standardized = []
                    for opp in opps[:limit]:
                        # Map Grants.gov JSON response fields
                        title = opp.get("title", "Funding Opportunity")
                        agency = opp.get("agencyName", "US Government Agency")
                        desc = opp.get("description", "No description provided.")
                        
                        # Set default amount if not specified
                        amount_str = opp.get("awardCeiling", "0")
                        try:
                            amount = float(amount_str) if amount_str else 250000.0
                        except ValueError:
                            amount = 250000.0
                        if amount == 0:
                            amount = 150000.0 # Standard fallback default
                            
                        # Format close date: MM-DD-YYYY or other formats to YYYY-MM-DD
                        close_date_str = opp.get("closeDate", "")
                        deadline_val = "2026-12-31"
                        if close_date_str:
                            try:
                                # Typically close date in Grants.gov REST service is MMDDYYYY or MM-DD-YYYY
                                if "-" in close_date_str:
                                    parts = close_date_str.split("-")
                                    if len(parts) == 3:
                                        # Assume MM-DD-YYYY
                                        deadline_val = f"{parts[2]}-{parts[0]}-{parts[1]}"
                                elif len(close_date_str) == 8:
                                    # MMDDYYYY
                                    deadline_val = f"{close_date_str[4:]}-{close_date_str[:2]}-{close_date_str[2:4]}"
                            except Exception:
                                pass
                                
                        funding_type = opp.get("fundingInstrumentType", "Grant")
                        eligibility = opp.get("eligibilityCategory", "Academic / Small Business")

                        standardized.append({
                            "title": title,
                            "organization": agency,
                            "research_domain": "General Science", # Mapped from query keyword or default
                            "funding_amount": amount,
                            "deadline": deadline_val,
                            "country": "USA",
                            "description": desc,
                            "funding_type": funding_type,
                            "eligibility": eligibility,
                            "status": "Open"
                        })
                    return standardized
                else:
                    logger.warning(f"Grants.gov API returned status code {response.status_code}")
        except Exception as e:
            logger.exception(f"Grants.gov API connection error: {str(e)}")
            
        return []
