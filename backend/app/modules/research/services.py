from abc import ABC, abstractmethod
import httpx
import logging

logger = logging.getLogger(__name__)

class ResearchService(ABC):
    @abstractmethod
    async def search_publications(self, query: str, limit: int = 10) -> list[dict]:
        """
        Search for scientific publications.
        Returns a list of dictionaries with standard keys:
        - title
        - authors (list of strings or string)
        - journal
        - year
        - doi
        - abstract
        - external_id
        """
        pass


class OpenAlexService(ResearchService):
    def __init__(self, contact_email: str = "admin@platform.com"):
        self.base_url = "https://api.openalex.org/works"
        self.headers = {"User-Agent": f"ResearchPlatform/1.0.0 (mailto:{contact_email})"}

    async def search_publications(self, query: str, limit: int = 10) -> list[dict]:
        if not query or len(query.strip()) < 2:
            return []
            
        params = {
            "search": query,
            "per_page": min(limit, 50)
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params, headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    
                    standardized = []
                    for work in results:
                        # Extract author names
                        authorships = work.get("authorships", [])
                        author_names = [a.get("author", {}).get("display_name", "") for a in authorships]
                        author_names = [name for name in author_names if name]
                        
                        # Reconstruct abstract if present (OpenAlex inverted index format)
                        abstract = ""
                        inv_index = work.get("abstract_inverted_index")
                        if inv_index:
                            try:
                                # Rebuild string from index
                                word_list = [""] * (max(sum(inv_index.values(), []), default=-1) + 1)
                                for word, positions in inv_index.items():
                                    for pos in positions:
                                        if pos < len(word_list):
                                            word_list[pos] = word
                                abstract = " ".join(word_list).strip()
                            except Exception:
                                abstract = "[Abstract formatting error]"
                        
                        host_venue = work.get("primary_location", {}).get("source", {})
                        journal = host_venue.get("display_name") if host_venue else None
                        
                        standardized.append({
                            "title": work.get("title") or "Untitled",
                            "authors": author_names,
                            "journal": journal or "Unknown Journal/Venue",
                            "year": work.get("publication_year"),
                            "doi": work.get("doi"),
                            "abstract": abstract or "No abstract available.",
                            "external_id": work.get("id")
                        })
                    return standardized
                else:
                    logger.error(f"OpenAlex API failed with status {response.status_code}")
        except Exception as e:
            logger.exception(f"Exception during OpenAlex search: {str(e)}")
            
        return []
