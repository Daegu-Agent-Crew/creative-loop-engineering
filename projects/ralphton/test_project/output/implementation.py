"""
calculator.py

This module provides basic arithmetic operations including addition, 
subtraction, multiplication, and division with type safety and error handling.
"""

from typing import Union

# Define a type alias for numeric inputs
Number = Union[int, float]


def _validate_inputs(a: Number, b: Number) -> None:
    """
    Internal helper to ensure inputs are numeric.
    
    Args:
        a: First operand.
        b: Second operand.
        
    Raises:
        TypeError: If either operand is not an int or float.
    """
    # Note: isinstance(True, int) is True in Python, 
    # but for standard calculators, we usually strictly check for numbers.
    if not isinstance(a, (int, float)) or isinstance(a, bool):
        raise TypeError(f"Operand 'a' must be numeric, not {type(a).__name__}")
    if not isinstance(b, (int, float)) or isinstance(b, bool):
        raise TypeError(f"Operand 'b' must be numeric, not {type(b).__name__}")


def add(a: Number, b: Number) -> float:
    """
    Returns the sum of two numbers.

    Args:
        a: The first number.
        b: The second number.

    Returns:
        The sum of a and b as a float.
    """
    _validate_inputs(a, b)
    return float(a + b)


def subtract(a: Number, b: Number) -> float:
    """
    Returns the difference between two numbers.

    Args:
        a: The number to be subtracted from.
        b: The number to subtract.

    Returns:
        The difference as a float.
    """
    _validate_inputs(a, b)
    return float(a - b)


def multiply(a: Number, b: Number) -> float:
    """
    Returns the product of two numbers.

    Args:
        a: The first factor.
        b: The second factor.

    Returns:
        The product as a float.
    """
    _validate_inputs(a, b)
    return float(a * b)


def divide(a: Number, b: Number) -> float:
    """
    Returns the quotient of two numbers.

    Args:
        a: The dividend.
        b: The divisor.

    Returns:
        The quotient as a float.

    Raises:
        ValueError: If the divisor is zero.
    """
    _validate_inputs(a, b)
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return float(a / b)

