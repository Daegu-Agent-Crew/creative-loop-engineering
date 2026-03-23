As a test-driven developer, I will first provide the test suite that defines the expected behavior of the `URLShortener` service based on your requirements.

```python
import pytest
import threading
from concurrent.futures import ThreadPoolExecutor
# The implementation will be imported from a module named 'service'
# from service import URLShortener 

# --- Fixtures ---

@pytest.fixture
def shortener():
    """Provides a fresh instance of URLShortener for each test."""
    # This assumes the class will be defined in the same file or imported
    return URLShortener()

# --- Happy Path Tests ---

def test_shorten_returns_6_char_code(shortener):
    """Requirement: shorten(url) -> 6-digit code."""
    url = "https://www.google.com"
    code = shortener.shorten(url)
    
    assert isinstance(code, str)
    assert len(code) == 6
    assert code.isalnum()

def test_expand_restores_original_url(shortener):
    """Requirement: expand(code) -> original URL."""
    url = "https://openai.com/blog"
    code = shortener.shorten(url)
    restored_url = shortener.expand(code)
    
    assert restored_url == url

def test_duplicate_url_returns_same_code(shortener):
    """Requirement: Duplicate URLs return the same code (Deduplication)."""
    url = "https://example.com"
    code1 = shortener.shorten(url)
    code2 = shortener.shorten(url)
    
    assert code1 == code2

def test_different_urls_return_different_codes(shortener):
    """Requirement: Different URLs should generate unique codes."""
    url1 = "https://example.com/1"
    url2 = "https://example.com/2"
    code1 = shortener.shorten(url1)
    code2 = shortener.shorten(url2)
    
    assert code1 != code2

# --- Edge Cases ---

def test_max_url_length_allowed(shortener):
    """Requirement: Support URL up to 2048 characters."""
    long_url = "https://example.com/" + ("a" * (2048 - 20))
    code = shortener.shorten(long_url)
    assert shortener.expand(code) == long_url

def test_min_url_length(shortener):
    """Edge case: Very short URL."""
    url = "http://a.b"
    code = shortener.shorten(url)
    assert shortener.expand(code) == url

# --- Error Handling ---

def test_expand_invalid_code_raises_keyerror(shortener):
    """Requirement: Invalid code lookup raises KeyError."""
    with pytest.raises(KeyError):
        shortener.expand("NONEXIST")

def test_shorten_url_exceeding_max_length_raises_valueerror(shortener):
    """Requirement: Max URL length is 2048. Exceeding it should raise ValueError."""
    too_long_url = "https://example.com/" + ("a" * 2049)
    with pytest.raises(ValueError, match="URL length exceeds maximum limit"):
        shortener.shorten(too_long_url)

# --- Thread Safety Tests ---

def test_thread_safety_on_concurrent_shorten(shortener):
    """Requirement: Thread safety. Multiple threads shortening same/different URLs."""
    urls = [f"https://example.com/{i}" for i in range(100)]
    
    def task(url):
        code = shortener.shorten(url)
        return shortener.expand(code) == url

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(task, urls))
    
    assert all(results)

def test_thread_safety_race_condition_same_url(shortener):
    """Ensure that multiple threads shortening the same URL simultaneously don't corrupt the cache."""
    url = "https://race-condition.com"
    
    def task():
        return shortener.shorten(url)

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(task) for _ in range(50)]
        codes = [f.result() for f in futures]
    
    # All threads should have received the exact same code
    assert len(set(codes)) == 1


# --- Implementation Placeholder (To make tests runnable) ---

import hashlib
import string

class URLShortener:
    """
    A thread-safe URL shortener service.
    """
    def __init__(self) -> None:
        self._url_to_code: dict[str, str] = {}
        self._code_to_url: dict[str, str] = {}
        self._lock = threading.Lock()
        self._max_length = 2048

    def shorten(self, url: str) -> str:
        """
        Shortens a URL into a 6-character code.
        
        Args:
            url: The original URL string.
            
        