# File: backend/app/services/deluge_service.py

import base64
import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class DelugeService:
    """Service for interacting with Deluge WebUI"""
    
    async def test_connection(
        self,
        host: str,
        port: int,
        password: str,
        use_ssl: bool = False
    ) -> Dict[str, Any]:
        """Test connection to Deluge WebUI"""
        try:
            protocol = "https" if use_ssl else "http"
            base_url = f"{protocol}://{host}:{port}"
            
            # Test authentication
            login_payload = {
                "method": "auth.login",
                "params": [password],
                "id": 1
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{base_url}/json",
                    json=login_payload,
                    headers={"Content-Type": "application/json"}
                )
                
                result = response.json()
                
                if result.get("error"):
                    return {
                        "success": False,
                        "message": f"Authentication failed: {result['error'].get('message', 'Unknown error')}"
                    }
                
                if not result.get("result"):
                    return {
                        "success": False,
                        "message": "Authentication failed: Invalid password"
                    }
                
                # Try to get daemon info to verify full connectivity
                session_cookie = response.cookies.get("_session_id")
                cookies = {"_session_id": session_cookie} if session_cookie else {}
                
                info_payload = {
                    "method": "web.get_host_status",
                    "params": ["127.0.0.1"],
                    "id": 2
                }
                
                info_response = await client.post(
                    f"{base_url}/json",
                    json=info_payload,
                    headers={"Content-Type": "application/json"},
                    cookies=cookies
                )
                
                info_result = info_response.json()
                
                return {
                    "success": True,
                    "message": "Connection successful",
                    "version_info": info_result.get("result", {})
                }
                
        except httpx.ConnectError:
            return {
                "success": False,
                "message": f"Cannot connect to {host}:{port}. Is Deluge WebUI running?"
            }
        except Exception as e:
            logger.error(f"[Deluge] Connection test error: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    async def add_torrent(
        self,
        host: str,
        port: int,
        password: str,
        torrent_url: str,  # Can be magnet link OR .torrent URL OR Prowlarr redirect
        label: Optional[str] = None,
        download_path: Optional[str] = None,
        use_ssl: bool = False
    ) -> Dict[str, Any]:
        """
        Add a torrent to Deluge via magnet link or .torrent URL
        
        Deluge 2.x uses:
        - web.add_torrents for magnet links (most common)
        - core.add_torrent_url for .torrent file URLs
        - core.add_torrent_magnet also works for magnets
        
        We'll try multiple methods with fallback
        """
        try:
            protocol = "https" if use_ssl else "http"
            base_url = f"{protocol}://{host}:{port}"
            
            # CRITICAL: Check if this is a Prowlarr/Jackett redirect URL
            # These look like: http://prowlarr:9696/7/download?apikey=...
            if "/download?" in torrent_url and "apikey=" in torrent_url:
                logger.info(f"[Deluge] Detected indexer redirect URL, fetching actual torrent/magnet...")
                
                # Fetch the redirect to get the actual magnet link or torrent
                try:
                    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as redirect_client:
                        redirect_response = await redirect_client.get(torrent_url)
                        
                        # Check if we got a magnet link (redirect)
                        if redirect_response.status_code == 200:
                            # Check if response is a magnet link
                            if redirect_response.text.startswith("magnet:"):
                                torrent_url = redirect_response.text
                                logger.info(f"[Deluge] Resolved to magnet link")
                            # Check if final URL is a magnet (from redirect)
                            elif str(redirect_response.url).startswith("magnet:"):
                                torrent_url = str(redirect_response.url)
                                logger.info(f"[Deluge] Redirected to magnet link")
                            # Otherwise it should be torrent file content
                            else:
                                # Save torrent file content temporarily or use final URL
                                final_url = str(redirect_response.url)
                                if final_url != torrent_url:
                                    torrent_url = final_url
                                    logger.info(f"[Deluge] Redirected to: {final_url}")
                except Exception as e:
                    logger.warning(f"[Deluge] Failed to resolve redirect URL: {e}, will try original URL")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Step 1: Authenticate
                logger.info(f"[Deluge] ========================================")
                logger.info(f"[Deluge] 🚀 Starting torrent add process")
                logger.info(f"[Deluge] 🌐 Host: {host}:{port}")
                logger.info(f"[Deluge] 🔒 SSL: {use_ssl}")
                logger.info(f"[Deluge] 🔗 Torrent URL/Magnet: {torrent_url[:150]}...")
                logger.info(f"[Deluge] 📁 Download path: {download_path or 'default'}")
                logger.info(f"[Deluge] 🏷️  Label: {label or 'none'}")
                logger.info(f"[Deluge] ========================================")
                
                login_payload = {
                    "method": "auth.login",
                    "params": [password],
                    "id": 1
                }
                
                logger.info(f"[Deluge] 🔐 Step 1: Authenticating to {host}:{port}...")
                
                auth_response = await client.post(
                    f"{base_url}/json",
                    json=login_payload,
                    headers={"Content-Type": "application/json"}
                )
                
                auth_result = auth_response.json()
                logger.info(f"[Deluge] 🔐 Auth response: {auth_result}")
                
                if not auth_result.get("result"):
                    logger.error(f"[Deluge] ❌ Authentication failed!")
                    raise Exception("Authentication failed")
                
                session_cookie = auth_response.cookies.get("_session_id")
                cookies = {"_session_id": session_cookie} if session_cookie else {}
                logger.info(f"[Deluge] ✅ Authentication successful! Session ID: {session_cookie[:20] if session_cookie else 'none'}...")
                
                logger.info("[Deluge] Authentication successful")
                
                # Step 2: Add torrent with method fallback
                options = {}
                if download_path:
                    options["download_location"] = download_path
                
                is_magnet = torrent_url.startswith("magnet:")
                is_http_url = torrent_url.startswith("http://") or torrent_url.startswith("https://")
                torrent_id = None
                
                # SPECIAL CASE: Check if HTTP URL redirects to a magnet link  
                # (This happens with Prowlarr/Jackett)
                if is_http_url and not is_magnet:
                    logger.info(f"[Deluge] 🔍 Checking if URL redirects to magnet...")
                    try:
                        check_response = await client.get(
                            torrent_url,
                            follow_redirects=False,
                            timeout=10.0
                        )
                        if check_response.status_code in (301, 302, 303, 307, 308):
                            location = check_response.headers.get('location', '')
                            if location.startswith('magnet:'):
                                logger.info(f"[Deluge] 🧲 URL redirects to MAGNET! Using magnet instead.")
                                torrent_url = location
                                is_magnet = True
                                is_http_url = False
                    except Exception as e:
                        logger.warning(f"[Deluge] ⚠️  Redirect check failed: {e}, continuing with original URL")
                
                # Choose the right method based on URL type
                if is_magnet:
                    # MAGNETS: Try core.add_torrent_magnet first, fallback if not available
                    logger.info(f"[Deluge] 🧲 Adding magnet link")
                    logger.info(f"[Deluge] 🔗 Magnet URI: {torrent_url[:150]}...")
                    
                    add_payload = {
                        "method": "core.add_torrent_magnet",
                        "params": [torrent_url, options],
                        "id": 2
                    }
                    
                    logger.info(f"[Deluge] 📨 Payload method: {add_payload['method']}")
                    logger.info(f"[Deluge] 📨 Payload options: {add_payload['params'][1]}")
                    
                    add_response = await client.post(
                        f"{base_url}/json",
                        json=add_payload,
                        headers={"Content-Type": "application/json"},
                        cookies=cookies
                    )
                    
                    logger.info(f"[Deluge] 📬 Deluge API response status: {add_response.status_code}")
                    result = add_response.json()
                    logger.info(f"[Deluge] 📬 Deluge API response: {result}")
                    
                    # FALLBACK: If core.add_torrent_magnet doesn't exist, try session method
                    if result.get("error") and result["error"].get("code") == 2:
                        logger.warning(f"[Deluge] ⚠️  core.add_torrent_magnet not available!")
                        logger.info(f"[Deluge] 🔄 Trying session method: session.add_torrent_magnet")
                        
                        # Try the daemon session method directly
                        add_payload = {
                            "method": "session.add_torrent_magnet",
                            "params": [torrent_url, options],
                            "id": 3
                        }
                        
                        logger.info(f"[Deluge] 📨 Fallback method: {add_payload['method']}")
                        
                        add_response = await client.post(
                            f"{base_url}/json",
                            json=add_payload,
                            headers={"Content-Type": "application/json"},
                            cookies=cookies
                        )
                        
                        logger.info(f"[Deluge] 📬 Fallback response status: {add_response.status_code}")
                        result = add_response.json()
                        logger.info(f"[Deluge] 📬 Fallback response: {result}")
                        
                        # If THAT doesn't work, let's see what methods ARE available
                        if result.get("error") and result["error"].get("code") == 2:
                            logger.error(f"[Deluge] ❌ session.add_torrent_magnet also not available!")
                            logger.info(f"[Deluge] 🔍 Querying available daemon methods...")
                            
                            # Try to get list of available methods
                            list_methods_payload = {
                                "method": "daemon.get_method_list",
                                "params": [],
                                "id": 4
                            }
                            
                            methods_response = await client.post(
                                f"{base_url}/json",
                                json=list_methods_payload,
                                headers={"Content-Type": "application/json"},
                                cookies=cookies
                            )
                            
                            methods_result = methods_response.json()
                            if methods_result.get("result"):
                                available_methods = methods_result["result"]
                                magnet_methods = [m for m in available_methods if 'magnet' in m.lower() or 'torrent' in m.lower()]
                                logger.info(f"[Deluge] 📋 Available torrent/magnet methods: {magnet_methods[:20]}")
                            else:
                                logger.error(f"[Deluge] ❌ Could not get method list")
                            
                            logger.error(f"[Deluge] ❌ No working magnet methods found!")
                            logger.error(f"[Deluge] 💡 Please check if Deluge daemon is properly connected")
                    
                elif is_http_url:
                    # HTTP/HTTPS URLs: Download the .torrent file first, then upload it
                    logger.info(f"[Deluge] 📥 Downloading torrent file from URL")
                    logger.info(f"[Deluge] 🔗 URL: {torrent_url[:150]}...")
                    
                    try:
                        # Download the .torrent file
                        logger.info(f"[Deluge] 🌐 Making HTTP GET request...")
                        torrent_response = await client.get(
                            torrent_url,
                            follow_redirects=True,  # Follow normal HTTP redirects
                            timeout=30.0
                        )
                        logger.info(f"[Deluge] ✅ HTTP Response: {torrent_response.status_code}")
                        logger.info(f"[Deluge] 📋 Content-Type: {torrent_response.headers.get('content-type', 'unknown')}")
                        
                        torrent_response.raise_for_status()
                        torrent_data = torrent_response.content
                        
                        logger.info(f"[Deluge] 📦 Downloaded {len(torrent_data)} bytes")
                        logger.info(f"[Deluge] 🔍 First 20 bytes (hex): {torrent_data[:20].hex()}")
                        
                        # Convert to base64
                        logger.info(f"[Deluge] 🔄 Encoding to base64...")
                        torrent_b64 = base64.b64encode(torrent_data).decode('utf-8')
                        logger.info(f"[Deluge] ✅ Base64 length: {len(torrent_b64)} characters")
                        
                        logger.info(f"[Deluge] 📤 Uploading to Deluge via core.add_torrent_file")
                        
                        # Use core.add_torrent_file with base64 data
                        add_payload = {
                            "method": "core.add_torrent_file",
                            "params": ["", torrent_b64, options],
                            "id": 2
                        }
                        
                        logger.info(f"[Deluge] 📨 Payload method: {add_payload['method']}")
                        
                        add_response = await client.post(
                            f"{base_url}/json",
                            json=add_payload,
                            headers={"Content-Type": "application/json"},
                            cookies=cookies
                        )
                        
                        logger.info(f"[Deluge] 📬 Deluge API response status: {add_response.status_code}")
                        result = add_response.json()
                        logger.info(f"[Deluge] 📬 Deluge API response: {result}")
                        
                    except httpx.HTTPError as e:
                        logger.error(f"[Deluge] ❌ HTTP download failed: {e}")
                        raise Exception(f"Failed to download torrent file: {e}")
                        
                else:
                    # Local file paths: Not supported
                    logger.warning(f"[Deluge] Unexpected torrent format: {torrent_url[:100]}")
                    raise Exception("Only magnet links and HTTP(S) URLs are supported")
                
                # Check for errors
                logger.info(f"[Deluge] 🔍 Checking API response for errors...")
                if result.get("error"):
                    error_code = result["error"].get("code")
                    error_msg = result["error"].get("message", "Unknown error")
                    logger.error(f"[Deluge] ❌ API error (code {error_code}): {error_msg}")
                    logger.error(f"[Deluge] ❌ Full error response: {result}")
                    raise Exception(f"{error_msg} (code: {error_code})")
                
                logger.info(f"[Deluge] ✅ No errors in response")
                torrent_id = result.get("result")
                logger.info(f"[Deluge] 🆔 Torrent ID from result: {torrent_id}")
                
                if not torrent_id:
                    logger.error(f"[Deluge] ❌ No torrent ID returned. Response: {result}")
                    raise Exception("No torrent ID returned")
                
                logger.info(f"[Deluge] ✅✅✅ Torrent added successfully!")
                logger.info(f"[Deluge] 🆔 Torrent ID: {torrent_id}")
                
                # Step 3: Set label (OPTIONAL - don't fail if this errors)
                if label and torrent_id:
                    logger.info(f"[Deluge] 🏷️  Step 4: Setting label '{label}'...")
                    try:
                        # First check if label exists, create if not
                        logger.info(f"[Deluge] 🔍 Checking if label '{label}' exists...")
                        
                        # Get existing labels
                        get_labels_payload = {
                            "method": "label.get_labels",
                            "params": [],
                            "id": 3
                        }
                        
                        labels_response = await client.post(
                            f"{base_url}/json",
                            json=get_labels_payload,
                            headers={"Content-Type": "application/json"},
                            cookies=cookies
                        )
                        
                        labels_result = labels_response.json()
                        logger.info(f"[Deluge] 📋 Label query result: {labels_result}")
                        
                        # Check if label plugin is available
                        if labels_result.get("error"):
                            error_code = labels_result["error"].get("code")
                            if error_code == 2:  # Method not found
                                logger.warning("[Deluge] ⚠️  Label plugin not installed - skipping label (non-fatal)")
                            else:
                                logger.warning(f"[Deluge] ⚠️  Label error: {labels_result['error'].get('message')}")
                        else:
                            # Label plugin exists, try to add label
                            existing_labels = labels_result.get("result", [])
                            logger.info(f"[Deluge] 📋 Existing labels: {existing_labels}")
                            
                            # Add label if it doesn't exist
                            if label not in existing_labels:
                                logger.info(f"[Deluge] ➕ Label '{label}' doesn't exist, creating it...")
                                add_label_payload = {
                                    "method": "label.add",
                                    "params": [label],
                                    "id": 4
                                }
                                
                                add_label_response = await client.post(
                                    f"{base_url}/json",
                                    json=add_label_payload,
                                    headers={"Content-Type": "application/json"},
                                    cookies=cookies
                                )
                                add_label_result = add_label_response.json()
                                logger.info(f"[Deluge] ✅ Label creation result: {add_label_result}")
                            else:
                                logger.info(f"[Deluge] ✅ Label '{label}' already exists")
                            
                            # Set the label on the torrent
                            logger.info(f"[Deluge] 🏷️  Applying label '{label}' to torrent {torrent_id}...")
                            set_label_payload = {
                                "method": "label.set_torrent",
                                "params": [torrent_id, label],
                                "id": 5
                            }
                            
                            label_set_response = await client.post(
                                f"{base_url}/json",
                                json=set_label_payload,
                                headers={"Content-Type": "application/json"},
                                cookies=cookies
                            )
                            
                            label_set_result = label_set_response.json()
                            logger.info(f"[Deluge] 📋 Label set result: {label_set_result}")
                            
                            if label_set_result.get("error"):
                                logger.warning(f"[Deluge] ⚠️  Could not set label: {label_set_result['error'].get('message')}")
                            else:
                                logger.info(f"[Deluge] ✅✅ Label '{label}' applied successfully!")
                    
                    except Exception as e:
                        logger.warning(f"[Deluge] ⚠️  Label operation failed (non-fatal): {e}")
                
                logger.info(f"[Deluge] ========================================")
                logger.info(f"[Deluge] 🎉 TORRENT ADD COMPLETE!")
                logger.info(f"[Deluge] 🆔 Torrent ID: {torrent_id}")
                logger.info(f"[Deluge] ========================================")
                
                return {
                    "success": True,
                    "torrent_id": torrent_id
                }
        
        except Exception as e:
            logger.error(f"[Deluge] add_torrent error: {e}")
            raise

# Singleton instance
deluge_service = DelugeService()