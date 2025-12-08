"""
🔧 Admin API Routes - System administration endpoints
"""

import logging
import asyncio
import subprocess
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


class CommandRequest(BaseModel):
    """Command execution request"""
    command: str


@router.get("/logs/stream")
async def stream_logs():
    """
    Stream live logs from the application
    Similar to `docker logs -f`
    """
    async def log_generator() -> AsyncGenerator[str, None]:
        """Generate log lines in real-time"""
        try:
            # Tail the log file
            process = await asyncio.create_subprocess_exec(
                'tail', '-f', '-n', '100', '/app/logs/evolibrary.log',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            while True:
                if process.stdout:
                    line = await process.stdout.readline()
                    if line:
                        yield f"data: {line.decode('utf-8', errors='ignore')}\n\n"
                    else:
                        break
                await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Log stream error: {e}")
            yield f"data: Error streaming logs: {e}\n\n"
    
    return StreamingResponse(
        log_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/exec")
async def execute_command(request: CommandRequest):
    """
    Execute a command inside the container
    ⚠️ USE WITH CAUTION - Can execute any command!
    """
    logger.warning(f"🔧 [ADMIN] Executing command: {request.command}")
    
    # Blacklist dangerous commands
    dangerous_keywords = ['rm -rf /', 'dd if=', 'mkfs', ':(){:|:&};:', 'fork']
    if any(keyword in request.command.lower() for keyword in dangerous_keywords):
        raise HTTPException(
            status_code=403,
            detail="Dangerous command blocked for safety"
        )
    
    try:
        # Execute command with timeout
        result = subprocess.run(
            request.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,
            cwd='/app'
        )
        
        output = result.stdout if result.stdout else result.stderr
        
        logger.info(f"✅ [ADMIN] Command executed successfully")
        
        return {
            "success": result.returncode == 0,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "output": output
        }
        
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=408,
            detail="Command timed out after 30 seconds"
        )
    except Exception as e:
        logger.error(f"❌ [ADMIN] Command execution failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Command execution failed: {str(e)}"
        )


@router.get("/system/info")
async def get_system_info():
    """Get system information"""
    try:
        # Get disk usage
        df_result = subprocess.run(
            ['df', '-h', '/books', '/config'],
            capture_output=True,
            text=True
        )
        
        # Get memory info
        free_result = subprocess.run(
            ['free', '-h'],
            capture_output=True,
            text=True
        )
        
        return {
            "disk": df_result.stdout,
            "memory": free_result.stdout
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))