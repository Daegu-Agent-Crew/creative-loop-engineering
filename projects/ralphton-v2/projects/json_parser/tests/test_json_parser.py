"""Tests for JSON parser library."""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from json_parser import parse, stringify, validate


# ============================================================
# parse() tests
# ============================================================

class TestParseStrings:
    """Test parsing JSON strings."""

    def test_simple_string(self) -> None:
        """Test parsing a simple string."""
        assert parse('"hello"') == "hello"

    def test_empty_string(self) -> None:
        """Test parsing an empty string."""
        assert parse('""') == ""

    def test_string_with_escape_sequences(self) -> None:
        """Test parsing strings with escape sequences."""
        assert parse(r'"hello\nworld"') == "hello\nworld"
        assert parse(r'"tab\there"') == "tab\there"
        assert parse(r'"back\\slash"') == "back\\slash"
        assert parse(r'"quote\"inside"') == 'quote"inside'

    def test_string_with_unicode_escape(self) -> None:
        """Test parsing strings with unicode escapes."""
        assert parse(r'"hello\u0041"') == "helloA"


class TestParseNumbers:
    """Test parsing JSON numbers."""

    def test_integer(self) -> None:
        """Test parsing integers."""
        assert parse("42") == 42

    def test_negative_integer(self) -> None:
        """Test parsing negative integers."""
        assert parse("-7") == -7

    def test_zero(self) -> None:
        """Test parsing zero."""
        assert parse("0") == 0

    def test_float(self) -> None:
        """Test parsing floating point numbers."""
        assert parse("3.14") == 3.14

    def test_negative_float(self) -> None:
        """Test parsing negative floats."""
        assert parse("-0.5") == -0.5

    def test_exponent(self) -> None:
        """Test parsing numbers with exponents."""
        assert parse("1e10") == 1e10
        assert parse("2.5E-3") == 2.5e-3


class TestParseBooleanAndNull:
    """Test parsing boolean and null values."""

    def test_true(self) -> None:
        """Test parsing true."""
        assert parse("true") is True

    def test_false(self) -> None:
        """Test parsing false."""
        assert parse("false") is False

    def test_null(self) -> None:
        """Test parsing null."""
        assert parse("null") is None


class TestParseArrays:
    """Test parsing JSON arrays."""

    def test_empty_array(self) -> None:
        """Test parsing empty array."""
        assert parse("[]") == []

    def test_array_of_integers(self) -> None:
        """Test parsing array of integers."""
        assert parse("[1, 2, 3]") == [1, 2, 3]

    def test_array_of_strings(self) -> None:
        """Test parsing array of strings."""
        assert parse('["a", "b", "c"]') == ["a", "b", "c"]

    def test_mixed_array(self) -> None:
        """Test parsing array with mixed types."""
        assert parse('[1, "two", true, null]') == [1, "two", True, None]

    def test_nested_array(self) -> None:
        """Test parsing nested arrays."""
        assert parse("[1, 2, [3, 4]]") == [1, 2, [3, 4]]

    def test_deeply_nested_array(self) -> None:
        """Test parsing deeply nested arrays."""
        assert parse("[[[1]]]") == [[[1]]]


class TestParseObjects:
    """Test parsing JSON objects."""

    def test_empty_object(self) -> None:
        """Test parsing empty object."""
        assert parse("{}") == {}

    def test_simple_object(self) -> None:
        """Test parsing simple object."""
        result = parse('{"name": "test", "value": 123}')
        assert result == {"name": "test", "value": 123}

    def test_nested_object(self) -> None:
        """Test parsing nested objects."""
        result = parse('{"a": {"b": {"c": 1}}}')
        assert result == {"a": {"b": {"c": 1}}}

    def test_object_with_array(self) -> None:
        """Test parsing object containing array."""
        result = parse('{"items": [1, 2, 3]}')
        assert result == {"items": [1, 2, 3]}

    def test_object_with_all_types(self) -> None:
        """Test parsing object with all JSON types."""
        json_str = '{"str": "hello", "num": 42, "float": 3.14, "bool": true, "nil": null, "arr": [1], "obj": {}}'
        result = parse(json_str)
        assert result["str"] == "hello"
        assert result["num"] == 42
        assert result["float"] == 3.14
        assert result["bool"] is True
        assert result["nil"] is None
        assert result["arr"] == [1]
        assert result["obj"] == {}


class TestParseWhitespace:
    """Test that parser handles whitespace correctly."""

    def test_leading_trailing_whitespace(self) -> None:
        """Test parsing with leading/trailing whitespace."""
        assert parse("  42  ") == 42

    def test_whitespace_in_object(self) -> None:
        """Test parsing object with extra whitespace."""
        assert parse('{ "a" : 1 , "b" : 2 }') == {"a": 1, "b": 2}

    def test_whitespace_in_array(self) -> None:
        """Test parsing array with extra whitespace."""
        assert parse('[ 1 , 2 , 3 ]') == [1, 2, 3]


class TestParseErrors:
    """Test that parser raises errors for invalid JSON."""

    def test_empty_input(self) -> None:
        """Test parsing empty string raises error."""
        with pytest.raises(ValueError):
            parse("")

    def test_invalid_token(self) -> None:
        """Test parsing invalid token raises error."""
        with pytest.raises(ValueError):
            parse("undefined")

    def test_trailing_comma_array(self) -> None:
        """Test trailing comma in array raises error."""
        with pytest.raises(ValueError):
            parse("[1, 2,]")

    def test_trailing_comma_object(self) -> None:
        """Test trailing comma in object raises error."""
        with pytest.raises(ValueError):
            parse('{"a": 1,}')

    def test_unclosed_string(self) -> None:
        """Test unclosed string raises error."""
        with pytest.raises(ValueError):
            parse('"hello')

    def test_unclosed_array(self) -> None:
        """Test unclosed array raises error."""
        with pytest.raises(ValueError):
            parse("[1, 2")

    def test_unclosed_object(self) -> None:
        """Test unclosed object raises error."""
        with pytest.raises(ValueError):
            parse('{"a": 1')

    def test_extra_data_after_value(self) -> None:
        """Test extra data after valid JSON raises error."""
        with pytest.raises(ValueError):
            parse("42 43")


# ============================================================
# stringify() tests
# ============================================================

class TestStringify:
    """Test JSON stringify function."""

    def test_string(self) -> None:
        """Test stringifying a string."""
        assert stringify("hello") == '"hello"'

    def test_integer(self) -> None:
        """Test stringifying an integer."""
        assert stringify(42) == "42"

    def test_float(self) -> None:
        """Test stringifying a float."""
        assert stringify(3.14) == "3.14"

    def test_true(self) -> None:
        """Test stringifying True."""
        assert stringify(True) == "true"

    def test_false(self) -> None:
        """Test stringifying False."""
        assert stringify(False) == "false"

    def test_none(self) -> None:
        """Test stringifying None."""
        assert stringify(None) == "null"

    def test_empty_list(self) -> None:
        """Test stringifying empty list."""
        assert stringify([]) == "[]"

    def test_list(self) -> None:
        """Test stringifying a list."""
        assert stringify([1, 2, 3]) == "[1,2,3]"

    def test_empty_dict(self) -> None:
        """Test stringifying empty dict."""
        assert stringify({}) == "{}"

    def test_dict(self) -> None:
        """Test stringifying a dict."""
        result = stringify({"a": 1, "b": 2})
        assert result == '{"a":1,"b":2}'

    def test_nested_structure(self) -> None:
        """Test stringifying nested structures."""
        obj = {"items": [1, 2, {"nested": True}]}
        result = stringify(obj)
        assert result == '{"items":[1,2,{"nested":true}]}'

    def test_string_with_special_chars(self) -> None:
        """Test stringifying string with special characters."""
        result = stringify("hello\nworld")
        assert result == r'"hello\nworld"'

    def test_string_with_quotes(self) -> None:
        """Test stringifying string with quotes."""
        result = stringify('say "hi"')
        assert result == r'"say \"hi\""'

    def test_roundtrip(self) -> None:
        """Test parse(stringify(obj)) == obj."""
        obj = {"name": "test", "values": [1, 2, 3], "active": True, "data": None}
        assert parse(stringify(obj)) == obj


# ============================================================
# validate() tests
# ============================================================

class TestValidate:
    """Test JSON validate function."""

    def test_valid_object(self) -> None:
        """Test validating a valid object."""
        assert validate('{"valid": true}') is True

    def test_valid_array(self) -> None:
        """Test validating a valid array."""
        assert validate("[1, 2, 3]") is True

    def test_valid_string(self) -> None:
        """Test validating a valid string."""
        assert validate('"hello"') is True

    def test_valid_number(self) -> None:
        """Test validating a valid number."""
        assert validate("42") is True

    def test_valid_boolean(self) -> None:
        """Test validating a valid boolean."""
        assert validate("true") is True

    def test_valid_null(self) -> None:
        """Test validating null."""
        assert validate("null") is True

    def test_invalid_json(self) -> None:
        """Test validating invalid JSON."""
        assert validate("{invalid}") is False

    def test_empty_string(self) -> None:
        """Test validating empty string."""
        assert validate("") is False

    def test_unclosed_brace(self) -> None:
        """Test validating unclosed brace."""
        assert validate('{"a": 1') is False

    def test_trailing_comma(self) -> None:
        """Test validating trailing comma."""
        assert validate("[1,]") is False
