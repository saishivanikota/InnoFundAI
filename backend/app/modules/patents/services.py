from abc import ABC, abstractmethod
import httpx
import logging

logger = logging.getLogger(__name__)

class PatentService(ABC):
    @abstractmethod
    async def search_patents(self, query: str, limit: int = 10) -> list[dict]:
        """
        Search for patent publications.
        Returns a list of dictionaries with standard keys:
        - patent_id
        - title
        - organization (assignee)
        - technology_domain
        - inventor
        - country
        - year
        - status
        """
        pass


class USPTOService(PatentService):
    def __init__(self):
        # USPTO Developer API endpoint for patents
        self.base_url = "https://developer.uspto.gov/ds-api/publications/search"

    async def search_patents(self, query: str, limit: int = 10) -> list[dict]:
        """
        Queries USPTO Open Data API.
        Attempts connection, falls back gracefully to local mock search on failure or limit issues.
        """
        if not query or len(query.strip()) < 2:
            return []
            
        # USPTO Ds-api payload format: criteria=searchText
        # It expects a POST request with form parameters
        payload = {
            "searchText": query,
            "start": 0,
            "rows": limit
        }
        
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(self.base_url, data=payload)
                if response.status_code == 200:
                    data = response.json()
                    # USPTO ds-api returns response -> docs
                    docs = data.get("response", {}).get("docs", [])
                    
                    standardized = []
                    for doc in docs:
                        # Extract fields mapping to our patent schema
                        patent_id = doc.get("publicationDocumentIdentifier", "")
                        title = doc.get("publicationTitle", "Patent Publication")
                        assignee = doc.get("assigneeEntityName", ["Unknown Assignee"])
                        if isinstance(assignee, list):
                            assignee = assignee[0] if assignee else "Unknown Assignee"
                            
                        inventor_list = doc.get("inventorNameText", [])
                        inventor = ", ".join(inventor_list) if isinstance(inventor_list, list) else str(inventor_list)
                        
                        year_str = doc.get("publicationDate", "")
                        year = 2024
                        if year_str and len(year_str) >= 4:
                            try:
                                year = int(year_str[:4])
                            except ValueError:
                                pass
                                
                        classification = doc.get("archiveClassificationClassificationText", ["General"])
                        if isinstance(classification, list) and classification:
                            tech_domain = classification[0]
                        else:
                            tech_domain = "General Technology"

                        standardized.append({
                            "patent_id": patent_id,
                            "title": title,
                            "organization": assignee,
                            "technology_domain": tech_domain,
                            "inventor": inventor or "Unknown Inventor",
                            "country": "US",
                            "year": year,
                            "status": "Granted"
                        })
                    return standardized
                else:
                    logger.warning(f"USPTO API returned status code {response.status_code}")
        except Exception as e:
            logger.exception(f"USPTO API connection error: {str(e)}")
            
        return []
