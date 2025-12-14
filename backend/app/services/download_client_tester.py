import httpx
from typing import Dict
from backend.app.schemas.download_clients import ClientType, TestStatus, DownloadClientTestResponse
from backend.app.services.deluge_service import deluge_service

class DownloadClientTester:
    """Service for testing connections to download clients"""
    
    def __init__(self):
        self.timeout = 10.0  # 10 second timeout
    
    async def test_connection(
        self,
        client_type: ClientType,
        host: str,
        port: int,
        username: str = None,
        password: str = None,
        api_key: str = None,
        use_ssl: bool = False
    ) -> DownloadClientTestResponse:
        """Test connection to a download client"""
        
        try:
            if client_type == ClientType.DELUGE:
                return await self._test_deluge(host, port, password, use_ssl)
            elif client_type == ClientType.QBITTORRENT:
                return await self._test_qbittorrent(host, port, username, password, use_ssl)
            elif client_type == ClientType.TRANSMISSION:
                return await self._test_transmission(host, port, username, password, use_ssl)
            elif client_type == ClientType.SABNZBD:
                return await self._test_sabnzbd(host, port, api_key, use_ssl)
            elif client_type == ClientType.NZBGET:
                return await self._test_nzbget(host, port, username, password, use_ssl)
            else:
                return DownloadClientTestResponse(
                    status=TestStatus.FAILED,
                    message=f"Unsupported client type: {client_type}"
                )
        
        except httpx.TimeoutException:
            return DownloadClientTestResponse(
                status=TestStatus.FAILED,
                message="Connection timed out - check if the service is running"
            )
        except httpx.ConnectError:
            return DownloadClientTestResponse(
                status=TestStatus.FAILED,
                message="Could not connect - check host, port, and network connectivity"
            )
        except Exception as e:
            return DownloadClientTestResponse(
                status=TestStatus.FAILED,
                message=f"Unexpected error: {str(e)}"
            )
    
    async def _test_deluge(
        self,
        host: str,
        port: int,
        password: str,
        use_ssl: bool
    ) -> DownloadClientTestResponse:
        """Test Deluge WebUI connection"""
        if not password:
            return DownloadClientTestResponse(
                status=TestStatus.FAILED,
                message="Password is required for Deluge"
            )
        
        return await deluge_service.test_connection(host, port, password, use_ssl)
    
    async def _test_qbittorrent(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        use_ssl: bool
    ) -> DownloadClientTestResponse:
        """Test qBittorrent connection - PLACEHOLDER"""
        # TODO: Implement qBittorrent testing
        return DownloadClientTestResponse(
            status=TestStatus.FAILED,
            message="qBittorrent integration coming soon - placeholder only"
        )
    
    async def _test_transmission(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        use_ssl: bool
    ) -> DownloadClientTestResponse:
        """Test Transmission connection - PLACEHOLDER"""
        # TODO: Implement Transmission testing
        return DownloadClientTestResponse(
            status=TestStatus.FAILED,
            message="Transmission integration coming soon - placeholder only"
        )
    
    async def _test_sabnzbd(
        self,
        host: str,
        port: int,
        api_key: str,
        use_ssl: bool
    ) -> DownloadClientTestResponse:
        """Test SABnzbd connection - PLACEHOLDER"""
        # TODO: Implement SABnzbd testing
        return DownloadClientTestResponse(
            status=TestStatus.FAILED,
            message="SABnzbd integration coming soon - placeholder only"
        )
    
    async def _test_nzbget(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        use_ssl: bool
    ) -> DownloadClientTestResponse:
        """Test NZBGet connection - PLACEHOLDER"""
        # TODO: Implement NZBGet testing
        return DownloadClientTestResponse(
            status=TestStatus.FAILED,
            message="NZBGet integration coming soon - placeholder only"
        )

# Singleton instance
download_client_tester = DownloadClientTester()