import httpx
import json
from typing import Dict, Optional, Any
from backend.app.schemas.download_clients import ClientType, TestStatus, DownloadClientTestResponse

class DelugeService:
    """Service for interacting with Deluge WebUI"""
    
    def __init__(self):
        self.timeout = 10.0  # 10 second timeout
        self._session_cookies: Dict[str, Any] = {}
    
    async def test_connection(
        self,
        host: str,
        port: int,
        password: str,
        use_ssl: bool = False
    ) -> DownloadClientTestResponse:
        """Test connection to Deluge WebUI"""
        
        # Password can be empty string for Deluge with no auth
        if password is None:
            password = ""
        
        protocol = "https" if use_ssl else "http"
        base_url = f"{protocol}://{host}:{port}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
                # Step 1: Check if Deluge is responding
                try:
                    check_response = await client.get(f"{base_url}/json")
                except httpx.ConnectError:
                    return DownloadClientTestResponse(
                        status=TestStatus.FAILED,
                        message=f"Cannot connect to {host}:{port}. Check: 1) Deluge WebUI is running, 2) Host/port correct, 3) Network connectivity (try 'localhost' if on same machine)"
                    )
                except httpx.TimeoutException:
                    return DownloadClientTestResponse(
                        status=TestStatus.FAILED,
                        message=f"Connection timed out to {host}:{port}. Deluge WebUI may not be responding or firewall blocking connection"
                    )
                
                # Step 2: Try to authenticate
                login_payload = {
                    "method": "auth.login",
                    "params": [password],
                    "id": 1
                }
                
                try:
                    auth_response = await client.post(
                        f"{base_url}/json",
                        json=login_payload,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if auth_response.status_code != 200:
                        return DownloadClientTestResponse(
                            status=TestStatus.FAILED,
                            message=f"HTTP {auth_response.status_code} - Deluge WebUI error"
                        )
                    
                    auth_data = auth_response.json()
                    
                    # Check if login was successful
                    if auth_data.get("error"):
                        error_msg = auth_data["error"].get("message", "Unknown error")
                        return DownloadClientTestResponse(
                            status=TestStatus.FAILED,
                            message=f"Authentication failed: {error_msg}"
                        )
                    
                    if not auth_data.get("result"):
                        return DownloadClientTestResponse(
                            status=TestStatus.FAILED,
                            message="Invalid password - authentication failed"
                        )
                    
                    # Save session cookies for subsequent requests
                    session_cookie = auth_response.cookies.get("_session_id")
                    cookies = {"_session_id": session_cookie} if session_cookie else {}
                    
                    # Step 3: Get configured labels
                    labels_payload = {
                        "method": "label.get_labels",
                        "params": [],
                        "id": 2
                    }
                    
                    labels_response = await client.post(
                        f"{base_url}/json",
                        json=labels_payload,
                        headers={"Content-Type": "application/json"},
                        cookies=cookies
                    )
                    
                    labels_data = labels_response.json()
                    configured_labels = []
                    
                    if labels_data.get("result"):
                        configured_labels = labels_data["result"]
                    
                    # Step 4: Get torrent count
                    torrents_payload = {
                        "method": "core.get_torrents_status",
                        "params": [{}, []],
                        "id": 3
                    }
                    
                    torrents_response = await client.post(
                        f"{base_url}/json",
                        json=torrents_payload,
                        headers={"Content-Type": "application/json"},
                        cookies=cookies
                    )
                    
                    torrents_data = torrents_response.json()
                    torrent_count = 0
                    
                    if torrents_data.get("result"):
                        torrent_count = len(torrents_data["result"])
                    
                    return DownloadClientTestResponse(
                        status=TestStatus.SUCCESS,
                        message=f"Connected to Deluge successfully",
                        details={
                            "torrent_count": torrent_count,
                            "configured_labels": configured_labels,
                            "label_plugin_enabled": isinstance(configured_labels, list)
                        }
                    )
                
                except json.JSONDecodeError:
                    return DownloadClientTestResponse(
                        status=TestStatus.FAILED,
                        message="Invalid response from Deluge - check URL and port"
                    )
                except Exception as e:
                    return DownloadClientTestResponse(
                        status=TestStatus.FAILED,
                        message=f"Error communicating with Deluge: {str(e)}"
                    )
        
        except Exception as e:
            return DownloadClientTestResponse(
                status=TestStatus.FAILED,
                message=f"Unexpected error: {str(e)}"
            )
    
    async def add_torrent(
        self,
        host: str,
        port: int,
        password: str,
        torrent_url: str,
        label: Optional[str] = None,
        download_path: Optional[str] = None,
        use_ssl: bool = False
    ) -> Dict[str, Any]:
        """Add a torrent to Deluge"""
        
        protocol = "https" if use_ssl else "http"
        base_url = f"{protocol}://{host}:{port}"
        
        async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
            # Authenticate
            login_payload = {
                "method": "auth.login",
                "params": [password],
                "id": 1
            }
            
            auth_response = await client.post(
                f"{base_url}/json",
                json=login_payload,
                headers={"Content-Type": "application/json"}
            )
            
            if not auth_response.json().get("result"):
                raise Exception("Authentication failed")
            
            session_cookie = auth_response.cookies.get("_session_id")
            cookies = {"_session_id": session_cookie} if session_cookie else {}
            
            # Add torrent with options
            options = {}
            if download_path:
                options["download_location"] = download_path
            
            add_payload = {
                "method": "core.add_torrent_url",
                "params": [torrent_url, options],
                "id": 2
            }
            
            add_response = await client.post(
                f"{base_url}/json",
                json=add_payload,
                headers={"Content-Type": "application/json"},
                cookies=cookies
            )
            
            result = add_response.json()
            
            if result.get("error"):
                raise Exception(result["error"].get("message", "Failed to add torrent"))
            
            torrent_id = result.get("result")
            
            # Set label if provided
            if label and torrent_id:
                label_payload = {
                    "method": "label.set_torrent",
                    "params": [torrent_id, label],
                    "id": 3
                }
                
                await client.post(
                    f"{base_url}/json",
                    json=label_payload,
                    headers={"Content-Type": "application/json"},
                    cookies=cookies
                )
            
            return {
                "success": True,
                "torrent_id": torrent_id
            }

# Singleton instance
deluge_service = DelugeService()