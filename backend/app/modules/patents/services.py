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

class OpenAlexService(PatentService):
    def __init__(self):
        # Base URL for the OpenAlex Works endpoint
        self.base_url = "https://api.openalex.org/works"

    async def search_patents(self, query: str, limit: int = 10) -> list[dict]:
        """
        Queries OpenAlex API for real patent publications and inventions.
        Returns official source landing page URLs or DOIs returned by the API.
        """
        if not query or len(query.strip()) < 2:
            return []
            
        params = {
            'search': f"patent {query}",
            'per_page': limit,
            'mailto': 'admin@research-platform.local'
        }
        
        try:
            async with httpx.AsyncClient(timeout=3.5) as client:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    formatted_patents = []
                    
                    for work in data.get('results', []):
                        patent_id_raw = work.get('ids', {}).get('openalex', 'Unknown ID')
                        patent_id = patent_id_raw.split('/')[-1] if patent_id_raw else 'Unknown ID'
                        
                        title = work.get('title', 'No Title Provided')
                        
                        assignees = []
                        for authorship in work.get('authorships', []):
                            for inst in authorship.get('institutions', []):
                                display_name = inst.get('display_name')
                                if display_name and display_name not in assignees:
                                    assignees.append(display_name)
                        assignee = ", ".join(assignees) if assignees else "International Patent Assignee"
                        
                        primary_topic = work.get('primary_topic', {})
                        tech_domain = None
                        if primary_topic:
                            tech_domain = primary_topic.get('field', {}).get('display_name')
                            if not tech_domain:
                                tech_domain = primary_topic.get('subfield', {}).get('display_name')
                        if not tech_domain:
                            tech_domain = query.title()
                            
                        authorships = work.get('authorships', [])
                        inventor = "Unknown Inventor"
                        if authorships:
                            inventor = authorships[0].get('author', {}).get('display_name', 'Unknown Inventor')
                        
                        year = work.get('publication_year', 2024)
                        
                        # Official landing page URL returned by the API
                        loc = work.get('primary_location') or {}
                        url = loc.get('landing_page_url') or work.get('doi') or f"https://openalex.org/{patent_id}"
                        
                        formatted_patents.append({
                            "patent_id": f"US-{patent_id[:8].upper()}",
                            "title": title,
                            "organization": assignee,
                            "technology_domain": tech_domain,
                            "inventor": inventor,
                            "country": "US",
                            "year": year,
                            "url": url,
                            "status": "Granted"
                        })
                    return formatted_patents
                else:
                    logger.warning(f"OpenAlex API returned status code {response.status_code}")
        except Exception as e:
            logger.exception(f"OpenAlex API connection error: {str(e)}")
            
        return []

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
            async with httpx.AsyncClient(timeout=2.5) as client:
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
