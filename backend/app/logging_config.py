"""
🦠 Evolibrary - Enhanced Logging Configuration
Beautiful, colorful logs with emojis for easy debugging!
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Any
import json

# Emoji mappings for different log levels and contexts
EMOJIS = {
    # Log levels
    "DEBUG": "🔍",
    "INFO": "ℹ️",
    "WARNING": "⚠️",
    "ERROR": "❌",
    "CRITICAL": "🔥",
    
    # Components
    "startup": "🚀",
    "shutdown": "🛑",
    "database": "🗄️",
    "api": "🌐",
    "router": "🔀",
    "middleware": "🔧",
    "health": "💚",
    "auth": "🔐",
    "book": "📚",
    "author": "✍️",
    "download": "⬇️",
    "file": "📄",
    "config": "⚙️",
    "morpho": "🦠",
    
    # Status
    "success": "✅",
    "failed": "❌",
    "processing": "⚡",
    "waiting": "⏳",
}


class EmojiFormatter(logging.Formatter):
    """Custom formatter with emojis and colors"""
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m',       # Reset
        'BOLD': '\033[1m',        # Bold
        'DIM': '\033[2m',         # Dim
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with emojis and colors"""
        
        # Get emoji for log level
        level_emoji = EMOJIS.get(record.levelname, "📝")
        
        # Determine component emoji from module name
        component_emoji = self._get_component_emoji(record)
        
        # Color for log level
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        bold = self.COLORS['BOLD']
        dim = self.COLORS['DIM']
        
        # Format timestamp
        timestamp = datetime.fromtimestamp(record.created).strftime('%H:%M:%S.%f')[:-3]
        
        # Format location (file:line)
        location = f"{record.filename}:{record.lineno}"
        
        # Build the formatted message
        formatted = (
            f"{dim}{timestamp}{reset} "
            f"{level_emoji} {color}{bold}{record.levelname:<8}{reset} "
            f"{component_emoji} {dim}{location:<25}{reset} "
            f"{record.getMessage()}"
        )
        
        # Add exception info if present
        if record.exc_info:
            formatted += f"\n{self.formatException(record.exc_info)}"
        
        return formatted
    
    def _get_component_emoji(self, record: logging.LogRecord) -> str:
        """Determine component emoji from module name"""
        module = record.module.lower()
        
        if 'main' in module or 'app' in module:
            return EMOJIS['startup']
        elif 'database' in module or 'db' in module:
            return EMOJIS['database']
        elif 'api' in module or 'router' in module:
            return EMOJIS['api']
        elif 'auth' in module:
            return EMOJIS['auth']
        elif 'book' in module:
            return EMOJIS['book']
        elif 'download' in module:
            return EMOJIS['download']
        elif 'config' in module:
            return EMOJIS['config']
        else:
            return EMOJIS['morpho']


def setup_logging(
    log_level: str = "DEBUG",
    log_file: Path | None = None,
    enable_colors: bool = True
) -> None:
    """
    Setup enhanced logging configuration
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional path to log file
        enable_colors: Enable colored output (disable for file logging)
    """
    
    # Fix Windows console encoding for emojis
    import sys
    import io
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    logger.handlers = []
    
    # Console handler with emojis
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    
    if enable_colors:
        console_handler.setFormatter(EmojiFormatter())
    else:
        console_handler.setFormatter(
            logging.Formatter(
                '%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        )
    
    logger.addHandler(console_handler)
    
    # File handler (no colors)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)  # Always DEBUG for files
        file_handler.setFormatter(
            logging.Formatter(
                '%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        )
        logger.addHandler(file_handler)
    
    # Configure uvicorn logging
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.handlers = []
    uvicorn_logger.addHandler(console_handler)
    
    uvicorn_access = logging.getLogger("uvicorn.access")
    uvicorn_access.handlers = []
    uvicorn_access.addHandler(console_handler)
    
    # SQLAlchemy logging
    sqlalchemy_logger = logging.getLogger("sqlalchemy.engine")
    sqlalchemy_logger.setLevel(logging.INFO)  # Only show INFO and above
    
    # Initial log message
    logger.info("🦠 Morpho is initializing logging system!")
    logger.debug(f"Log level set to: {log_level}")
    if log_file:
        logger.debug(f"Logging to file: {log_file}")


# Helper functions for structured logging
def log_startup(logger: logging.Logger, message: str) -> None:
    """Log startup message"""
    logger.info(f"🚀 {message}")


def log_shutdown(logger: logging.Logger, message: str) -> None:
    """Log shutdown message"""
    logger.info(f"🛑 {message}")


def log_database(logger: logging.Logger, message: str, level: str = "info") -> None:
    """Log database operation"""
    getattr(logger, level)(f"🗄️  {message}")


def log_api(logger: logging.Logger, message: str, level: str = "info") -> None:
    """Log API operation"""
    getattr(logger, level)(f"🌐 {message}")


def log_success(logger: logging.Logger, message: str) -> None:
    """Log success"""
    logger.info(f"✅ {message}")


def log_error(logger: logging.Logger, message: str, exc: Exception | None = None) -> None:
    """Log error"""
    logger.error(f"❌ {message}", exc_info=exc)


def log_processing(logger: logging.Logger, message: str) -> None:
    """Log processing"""
    logger.info(f"⚡ {message}")


# Export
__all__ = [
    "setup_logging",
    "EmojiFormatter",
    "log_startup",
    "log_shutdown",
    "log_database",
    "log_api",
    "log_success",
    "log_error",
    "log_processing",
]