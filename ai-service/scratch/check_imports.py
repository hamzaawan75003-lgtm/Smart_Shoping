"""
scratch/check_imports.py
~~~~~~~~~~~~~~~~~~~~~~~~
Diagnostic script — run this to verify all required packages are installed
and importable in your current Python environment.

Usage:
    python check_imports.py

Each check prints OK or MISSING so you know exactly what to fix.
"""

import importlib.util
import sys


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _check_package(package_name: str) -> bool:
    """Return True if the package is importable, False otherwise."""
    return importlib.util.find_spec(package_name) is not None


def _report(label: str, ok: bool, fix: str = "") -> None:
    status = "OK     " if ok else "MISSING"
    print(f"  [{status}]  {label}")
    if not ok and fix:
        print(f"             Fix: {fix}")


# ---------------------------------------------------------------------------
# 1. Core packages
# ---------------------------------------------------------------------------
print("\n── Core packages ──────────────────────────────────────────────────────")

_report("fastapi", _check_package("fastapi"), "pip install fastapi")
_report("uvicorn", _check_package("uvicorn"), "pip install uvicorn[standard]")
_report("httpx", _check_package("httpx"), "pip install httpx")
_report("pydantic", _check_package("pydantic"), "pip install pydantic")
_report("dotenv", _check_package("dotenv"), "pip install python-dotenv")

# ---------------------------------------------------------------------------
# 2. AI / ML packages
# ---------------------------------------------------------------------------
print("\n── AI / ML packages ───────────────────────────────────────────────────")

_report("gradio_client", _check_package("gradio_client"), "pip install gradio_client")
_report("groq", _check_package("groq"), "pip install groq")

# ---------------------------------------------------------------------------
# 3. Storage / cloud packages
# ---------------------------------------------------------------------------
print("\n── Storage / cloud packages ───────────────────────────────────────────")

_report("cloudinary", _check_package("cloudinary"), "pip install cloudinary")
_report("supabase", _check_package("supabase"), "pip install supabase")

# ---------------------------------------------------------------------------
# 4. LangChain packages
#    NOTE: langchain.memory was FULLY REMOVED in langchain v0.2+
#    Do NOT import from langchain.memory — it no longer exists.
#    ConversationBufferWindowMemory now lives in langchain_community.memory
# ---------------------------------------------------------------------------
print("\n── LangChain packages ─────────────────────────────────────────────────")

_report("langchain", _check_package("langchain"), "pip install langchain")
_report(
    "langchain_community",
    _check_package("langchain_community"),
    "pip install langchain-community",
)
_report(
    "langchain_core", _check_package("langchain_core"), "pip install langchain-core"
)
_report(
    "langchain_groq", _check_package("langchain_groq"), "pip install langchain-groq"
)

# ---------------------------------------------------------------------------
# 5. LangChain class availability (runtime import tests)
# ---------------------------------------------------------------------------
print("\n── LangChain class availability ───────────────────────────────────────")

# ChatMessageHistory — lives in langchain_community
try:
    from langchain_community.chat_message_histories import ChatMessageHistory as _CMH  # noqa: F401

    _report("langchain_community.chat_message_histories.ChatMessageHistory", True)
except ImportError:
    _report(
        "langchain_community.chat_message_histories.ChatMessageHistory",
        False,
        "pip install langchain-community",
    )

# ConversationBufferWindowMemory — lives in langchain_community.memory (v0.2+)
# langchain.memory no longer exists — never import from it
try:
    from langchain_community.memory import ConversationBufferWindowMemory as _CBWM  # noqa: F401

    _report("langchain_community.memory.ConversationBufferWindowMemory", True)
except ImportError:
    _report(
        "langchain_community.memory.ConversationBufferWindowMemory",
        False,
        "pip install langchain-community",
    )

# ---------------------------------------------------------------------------
# 6. Python environment summary
# ---------------------------------------------------------------------------
print("\n── Python environment ─────────────────────────────────────────────────")
print(f"  Python version : {sys.version}")
print(f"  Executable     : {sys.executable}")
print()
