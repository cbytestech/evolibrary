import httpx
import json
from typing import Dict, Tuple
from backend.app.schemas.apps import AppType, TestStatus, AppTestResponse

class AppConnectionTester:
    """Service for testing connections to external applications"""
    
    def __init__(self):
        self.timeout = 10.0  # 10 second timeout
    
    async def test_connection(
        self, 
        app_type: AppType, 
        base_url: str, 
        api_key: str = None,
        password: str = None
    ) -> AppTestResponse:
        """Test connection to an external app"""
        
        # Remove trailing slash
        base_url = base_url.rstrip('/')
        
        try:
            if app_type == AppType.PROWLARR:
                return await self._test_prowlarr(base_url, api_key)
            elif app_type == AppType.JACKETT:
                return await self._test_jackett(base_url, api_key, password)
            elif app_type == AppType.FLARESOLVERR:
                return await self._test_flaresolverr(base_url)
            elif app_type == AppType.KAVITA:
                return await self._test_kavita(base_url, api_key)
            else:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Unsupported app type: {app_type}"
                )
        
        except httpx.TimeoutException:
            return AppTestResponse(
                status=TestStatus.FAILED,
                message="Connection timed out - check if the service is running"
            )
        except httpx.ConnectError:
            return AppTestResponse(
                status=TestStatus.FAILED,
                message="Could not connect - check URL and network connectivity"
            )
        except Exception as e:
            return AppTestResponse(
                status=TestStatus.FAILED,
                message=f"Unexpected error: {str(e)}"
            )
    
    async def _test_prowlarr(self, base_url: str, api_key: str) -> AppTestResponse:
        """Test Prowlarr connection"""
        if not api_key:
            return AppTestResponse(
                status=TestStatus.FAILED,
                message="API key is required for Prowlarr"
            )
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # Test system status endpoint
            response = await client.get(
                f"{base_url}/api/v1/system/status",
                headers={"X-Api-Key": api_key}
            )
            
            if response.status_code == 401:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid API key - 401 Unauthorized"
                )
            
            if response.status_code == 403:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid API key - 403 Forbidden"
                )
            
            if response.status_code != 200:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Connection failed - HTTP {response.status_code}"
                )
            
            try:
                data = response.json()
            except:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid response from Prowlarr"
                )
            
            # Get indexer count
            indexer_response = await client.get(
                f"{base_url}/api/v1/indexer",
                headers={"X-Api-Key": api_key}
            )
            
            indexer_count = 0
            if indexer_response.status_code == 200:
                try:
                    indexers = indexer_response.json()
                    indexer_count = len(indexers)
                except:
                    pass
            
            return AppTestResponse(
                status=TestStatus.SUCCESS,
                message=f"Connected to Prowlarr v{data.get('version', 'unknown')}",
                details={
                    "version": data.get("version"),
                    "indexer_count": indexer_count,
                    "app_name": data.get("appName", "Prowlarr")
                }
            )
    
    async def _test_jackett(self, base_url: str, api_key: str, password: str = None) -> AppTestResponse:
        """Test Jackett connection with optional password auth"""
        if not api_key:
            return AppTestResponse(
                status=TestStatus.FAILED,
                message="API key is required for Jackett"
            )
        
        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=False) as client:
            # If password provided, try to authenticate first
            if password:
                try:
                    # Login to Jackett
                    login_response = await client.post(
                        f"{base_url}/UI/Dashboard",
                        data={"password": password},
                        headers={"Content-Type": "application/x-www-form-urlencoded"}
                    )
                    
                    # Extract cookies for authenticated requests
                    cookies = login_response.cookies
                    
                    # Now try API with cookies
                    response = await client.get(
                        f"{base_url}/api/v2.0/indexers",
                        params={"apikey": api_key},
                        cookies=cookies
                    )
                except Exception as e:
                    return AppTestResponse(
                        status=TestStatus.FAILED,
                        message=f"Login failed: {str(e)}"
                    )
            else:
                # Try without password
                try:
                    response = await client.get(
                        f"{base_url}/api/v2.0/indexers",
                        params={"apikey": api_key}
                    )
                except Exception as e:
                    return AppTestResponse(
                        status=TestStatus.FAILED,
                        message=f"Connection error: {str(e)}"
                    )
            
            # Handle redirect to login - means we need password
            if response.status_code == 302:
                location = response.headers.get('location', '')
                if '/UI/Login' in location:
                    if password:
                        return AppTestResponse(
                            status=TestStatus.FAILED,
                            message="Invalid password - check your Jackett admin password"
                        )
                    return AppTestResponse(
                        status=TestStatus.FAILED,
                        message="Jackett requires password - enter your admin password"
                    )
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Unexpected redirect to: {location}"
                )
            
            # Check status codes
            if response.status_code == 403:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid API key - Access denied"
                )
            
            if response.status_code == 401:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid API key - Unauthorized"
                )
            
            if response.status_code == 404:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Jackett API not found - check URL and port"
                )
            
            if response.status_code != 200:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Connection failed - HTTP {response.status_code}"
                )
            
            # Parse and validate response
            try:
                indexers = response.json()
                if not isinstance(indexers, list):
                    return AppTestResponse(
                        status=TestStatus.FAILED,
                        message="Invalid response from Jackett - expected list of indexers"
                    )
                
                # Count configured vs total
                configured_count = sum(1 for idx in indexers if idx.get('configured', False))
                total_count = len(indexers)
                
                if total_count == 0:
                    return AppTestResponse(
                        status=TestStatus.SUCCESS,
                        message="Connected to Jackett - No indexers configured yet",
                        details={
                            "total_indexers": 0,
                            "configured_indexers": 0
                        }
                    )
                
                return AppTestResponse(
                    status=TestStatus.SUCCESS,
                    message=f"Connected to Jackett - {configured_count} configured of {total_count} total indexers",
                    details={
                        "total_indexers": total_count,
                        "configured_indexers": configured_count
                    }
                )
            except Exception as e:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Invalid response from Jackett: {str(e)}"
                )
    
    async def _test_flaresolverr(self, base_url: str) -> AppTestResponse:
        """Test FlareSolverr connection"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # FlareSolverr health endpoint
            try:
                response = await client.get(f"{base_url}/health")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        status = data.get("status", "unknown")
                        return AppTestResponse(
                            status=TestStatus.SUCCESS,
                            message=f"Connected to FlareSolverr (Status: {status})",
                            details=data
                        )
                    except:
                        pass
            except:
                pass
            
            # Try root endpoint as fallback
            try:
                response = await client.get(base_url)
                if response.status_code == 200:
                    return AppTestResponse(
                        status=TestStatus.SUCCESS,
                        message="Connected to FlareSolverr",
                        details={"note": "Health endpoint not available, but service is responding"}
                    )
            except:
                pass
            
            return AppTestResponse(
                status=TestStatus.FAILED,
                message="FlareSolverr not responding - check if service is running"
            )
    
    async def _test_kavita(self, base_url: str, api_key: str) -> AppTestResponse:
        """Test Kavita connection"""
        if not api_key:
            return AppTestResponse(
                status=TestStatus.FAILED,
                message="API key (JWT token) is required for Kavita"
            )
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # Test library endpoint
            response = await client.get(
                f"{base_url}/api/Library",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            
            if response.status_code == 401:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid API key/token - Unauthorized"
                )
            
            if response.status_code == 403:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid API key/token - Forbidden"
                )
            
            if response.status_code != 200:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Connection failed - HTTP {response.status_code}"
                )
            
            try:
                libraries = response.json()
                library_count = len(libraries) if isinstance(libraries, list) else 0
                
                return AppTestResponse(
                    status=TestStatus.SUCCESS,
                    message=f"Connected to Kavita - {library_count} libraries found",
                    details={
                        "library_count": library_count
                    }
                )
            except:
                return AppTestResponse(
                    status=TestStatus.FAILED,
                    message="Invalid response from Kavita"
                )

# Singleton instance
app_tester = AppConnectionTester()