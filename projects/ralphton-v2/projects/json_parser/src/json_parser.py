"""JSON parser library - parses, stringifies, and validates JSON without using the json module.

Implements recursive descent parsing for full JSON spec support including
objects, arrays, strings, numbers, booleans, and null.
"""
from typing import Any, Tuple


# String escape mapping
_ESCAPE_MAP: dict[str, str] = {
    '"': '"',
    '\\': '\\',
    '/': '/',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t',
}

_REVERSE_ESCAPE_MAP: dict[str, str] = {
    '"': '\\"',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
}


def _skip_whitespace(s: str, pos: int) -> int:
    """Skip whitespace characters in the string.

    Args:
        s: The JSON string.
        pos: Current position.

    Returns:
        Position after skipping whitespace.
    """
    while pos < len(s) and s[pos] in ' \t\n\r':
        pos += 1
    return pos


def _parse_string(s: str, pos: int) -> Tuple[str, int]:
    """Parse a JSON string starting at pos (which should point to opening quote).

    Args:
        s: The JSON string.
        pos: Position of the opening quote.

    Returns:
        Tuple of (parsed string value, position after closing quote).

    Raises:
        ValueError: If string is malformed.
    """
    if pos >= len(s) or s[pos] != '"':
        raise ValueError(f"Expected '\"' at position {pos}")
    pos += 1  # skip opening quote
    result: list[str] = []
    while pos < len(s):
        ch = s[pos]
        if ch == '"':
            return ''.join(result), pos + 1
        if ch == '\\':
            pos += 1
            if pos >= len(s):
                raise ValueError("Unexpected end of string after backslash")
            esc = s[pos]
            if esc == 'u':
                if pos + 4 >= len(s):
                    raise ValueError("Incomplete unicode escape")
                hex_str = s[pos + 1:pos + 5]
                result.append(chr(int(hex_str, 16)))
                pos += 5
            elif esc in _ESCAPE_MAP:
                result.append(_ESCAPE_MAP[esc])
                pos += 1
            else:
                raise ValueError(f"Invalid escape character: \\{esc}")
        else:
            result.append(ch)
            pos += 1
    raise ValueError("Unterminated string")


def _parse_number(s: str, pos: int) -> Tuple[Any, int]:
    """Parse a JSON number starting at pos.

    Args:
        s: The JSON string.
        pos: Current position.

    Returns:
        Tuple of (parsed number, position after number).

    Raises:
        ValueError: If number is malformed.
    """
    start = pos
    if pos < len(s) and s[pos] == '-':
        pos += 1
    if pos >= len(s) or not s[pos].isdigit():
        raise ValueError(f"Invalid number at position {start}")
    # Integer part
    if s[pos] == '0':
        pos += 1
    else:
        while pos < len(s) and s[pos].isdigit():
            pos += 1
    is_float = False
    # Fractional part
    if pos < len(s) and s[pos] == '.':
        is_float = True
        pos += 1
        if pos >= len(s) or not s[pos].isdigit():
            raise ValueError(f"Invalid number at position {start}")
        while pos < len(s) and s[pos].isdigit():
            pos += 1
    # Exponent part
    if pos < len(s) and s[pos] in 'eE':
        is_float = True
        pos += 1
        if pos < len(s) and s[pos] in '+-':
            pos += 1
        if pos >= len(s) or not s[pos].isdigit():
            raise ValueError(f"Invalid number at position {start}")
        while pos < len(s) and s[pos].isdigit():
            pos += 1
    num_str = s[start:pos]
    if is_float:
        return float(num_str), pos
    return int(num_str), pos


def _parse_value(s: str, pos: int) -> Tuple[Any, int]:
    """Parse any JSON value starting at pos.

    Args:
        s: The JSON string.
        pos: Current position (whitespace will be skipped).

    Returns:
        Tuple of (parsed value, position after the value).

    Raises:
        ValueError: If the JSON is malformed.
    """
    pos = _skip_whitespace(s, pos)
    if pos >= len(s):
        raise ValueError("Unexpected end of input")

    ch = s[pos]

    if ch == '"':
        return _parse_string(s, pos)
    if ch == '{':
        return _parse_object(s, pos)
    if ch == '[':
        return _parse_array(s, pos)
    if ch == 't':
        if s[pos:pos + 4] == 'true':
            return True, pos + 4
        raise ValueError(f"Invalid token at position {pos}")
    if ch == 'f':
        if s[pos:pos + 5] == 'false':
            return False, pos + 5
        raise ValueError(f"Invalid token at position {pos}")
    if ch == 'n':
        if s[pos:pos + 4] == 'null':
            return None, pos + 4
        raise ValueError(f"Invalid token at position {pos}")
    if ch == '-' or ch.isdigit():
        return _parse_number(s, pos)

    raise ValueError(f"Unexpected character '{ch}' at position {pos}")


def _parse_array(s: str, pos: int) -> Tuple[list[Any], int]:
    """Parse a JSON array starting at pos.

    Args:
        s: The JSON string.
        pos: Position of the opening bracket.

    Returns:
        Tuple of (parsed list, position after closing bracket).

    Raises:
        ValueError: If the array is malformed.
    """
    pos += 1  # skip '['
    result: list[Any] = []
    pos = _skip_whitespace(s, pos)
    if pos < len(s) and s[pos] == ']':
        return result, pos + 1

    while True:
        value, pos = _parse_value(s, pos)
        result.append(value)
        pos = _skip_whitespace(s, pos)
        if pos >= len(s):
            raise ValueError("Unterminated array")
        if s[pos] == ']':
            return result, pos + 1
        if s[pos] != ',':
            raise ValueError(f"Expected ',' or ']' at position {pos}")
        pos += 1  # skip ','
        # Check for trailing comma
        pos = _skip_whitespace(s, pos)
        if pos < len(s) and s[pos] == ']':
            raise ValueError(f"Trailing comma in array at position {pos}")


def _parse_object(s: str, pos: int) -> Tuple[dict[str, Any], int]:
    """Parse a JSON object starting at pos.

    Args:
        s: The JSON string.
        pos: Position of the opening brace.

    Returns:
        Tuple of (parsed dict, position after closing brace).

    Raises:
        ValueError: If the object is malformed.
    """
    pos += 1  # skip '{'
    result: dict[str, Any] = {}
    pos = _skip_whitespace(s, pos)
    if pos < len(s) and s[pos] == '}':
        return result, pos + 1

    while True:
        pos = _skip_whitespace(s, pos)
        if pos >= len(s) or s[pos] != '"':
            raise ValueError(f"Expected string key at position {pos}")
        key, pos = _parse_string(s, pos)
        pos = _skip_whitespace(s, pos)
        if pos >= len(s) or s[pos] != ':':
            raise ValueError(f"Expected ':' at position {pos}")
        pos += 1  # skip ':'
        value, pos = _parse_value(s, pos)
        result[key] = value
        pos = _skip_whitespace(s, pos)
        if pos >= len(s):
            raise ValueError("Unterminated object")
        if s[pos] == '}':
            return result, pos + 1
        if s[pos] != ',':
            raise ValueError(f"Expected ',' or '}}' at position {pos}")
        pos += 1  # skip ','
        # Check for trailing comma
        pos = _skip_whitespace(s, pos)
        if pos < len(s) and s[pos] == '}':
            raise ValueError(f"Trailing comma in object at position {pos}")


def parse(json_string: str) -> Any:
    """Parse a JSON string into a Python object.

    Supports all JSON types: objects, arrays, strings, numbers, booleans, and null.
    Uses recursive descent parsing without the json module.

    Args:
        json_string: A valid JSON string to parse.

    Returns:
        The corresponding Python object (dict, list, str, int, float, bool, or None).

    Raises:
        ValueError: If the input is not valid JSON.
    """
    if not json_string or not json_string.strip():
        raise ValueError("Empty JSON input")
    value, pos = _parse_value(json_string, 0)
    pos = _skip_whitespace(json_string, pos)
    if pos != len(json_string):
        raise ValueError(f"Unexpected data after JSON value at position {pos}")
    return value


def _escape_string(s: str) -> str:
    """Escape a string for JSON output.

    Args:
        s: The string to escape.

    Returns:
        The escaped string wrapped in double quotes.
    """
    result: list[str] = ['"']
    for ch in s:
        if ch in _REVERSE_ESCAPE_MAP:
            result.append(_REVERSE_ESCAPE_MAP[ch])
        elif ord(ch) < 0x20:
            result.append(f'\\u{ord(ch):04x}')
        else:
            result.append(ch)
    result.append('"')
    return ''.join(result)


def stringify(obj: Any) -> str:
    """Convert a Python object to a compact JSON string.

    Supports dict, list, str, int, float, bool, and None.

    Args:
        obj: The Python object to convert.

    Returns:
        A compact JSON string representation (no extra whitespace).

    Raises:
        TypeError: If the object type is not JSON-serializable.
    """
    if obj is None:
        return "null"
    if obj is True:
        return "true"
    if obj is False:
        return "false"
    if isinstance(obj, int):
        return str(obj)
    if isinstance(obj, float):
        result = repr(obj)
        # Use str() for cleaner output when it doesn't lose precision
        str_result = str(obj)
        if float(str_result) == obj:
            return str_result
        return result
    if isinstance(obj, str):
        return _escape_string(obj)
    if isinstance(obj, list):
        items = ','.join(stringify(item) for item in obj)
        return f'[{items}]'
    if isinstance(obj, dict):
        pairs = ','.join(
            f'{_escape_string(str(k))}:{stringify(v)}'
            for k, v in obj.items()
        )
        return f'{{{pairs}}}'
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def validate(json_string: str) -> bool:
    """Check if a string is valid JSON.

    Args:
        json_string: The string to validate.

    Returns:
        True if the string is valid JSON, False otherwise.
    """
    try:
        parse(json_string)
        return True
    except (ValueError, TypeError):
        return False
