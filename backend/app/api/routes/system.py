"""
System Info Routes - Returns server info like public IP
"""
from fastapi import APIRouter
import httpx

router = APIRouter()


@router.get("/system/ip")
async def get_system_ips():
    """
    Get server's public IP address (will show VPN IP if behind VPN)
    and local/container IP
    """
    public_ip = None
    
    try:
        # Fetch public IP from ipify
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("https://api.ipify.org?format=json")
            if response.status_code == 200:
                data = response.json()
                public_ip = data.get("ip")
    except Exception as e:
        print(f"Failed to fetch public IP: {e}")
    
    return {
        "public_ip": public_ip,
        "note": "This is the server's public IP (VPN IP if using VPN)"
    }