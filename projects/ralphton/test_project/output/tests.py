import pytest
# We assume the implementation will be in calculator.py
# from calculator import add, subtract, multiply, divide

# --- Test Cases for add(a, b) ---

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),           # Positive integers
    (-1, 1, 0),          # Negative and positive
    (-1, -1, -2),        # Both negative
    (0, 0, 0),           # Zeroes
    (1.5, 2.5, 4.0),     # Floats
    (0.1, 0.2, 0.3),     # Floating point precision
])
def test_add(a, b, expected):
    from calculator import add
    assert add(a, b) == pytest.approx(expected)


# --- Test Cases for subtract(a, b) ---

@pytest.mark.parametrize("a, b, expected", [
    (10, 5, 5),
    (5, 10, -5),
    (-1, -1, 0),
    (0, 5, -5),
    (10.5, 0.5, 10.0),
])
def test_subtract(a, b, expected):
    from calculator import subtract
    assert subtract(a, b) == pytest.approx(expected)


# --- Test Cases for multiply(a, b) ---

@pytest.mark.parametrize("a, b, expected", [
    (3, 4, 12),
    (-3, 4, -12),
    (-3, -4, 12),
    (10, 0, 0),          # Multiplication by zero
    (0.5, 2, 1.0),
])
def test_multiply(a, b, expected):
    from calculator import multiply
    assert multiply(a, b) == pytest.approx(expected)


# --- Test Cases for divide(a, b) ---

@pytest.mark.parametrize("a, b, expected", [
    (10, 2, 5.0),
    (5, 2, 2.5),         # Float result
    (-10, 2, -5.0),
    (0, 5, 0.0),         # Zero numerator
])
def test_divide_happy_path(a, b, expected):
    from calculator import divide
    assert divide(a, b) == pytest.approx(expected)

def test_divide_by_zero():
    """Requirement: ValueError for divide by zero"""
    from calculator import divide
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)


# --- Type Hint & Edge Case Validation (Optional but recommended) ---

def test_add_non_numeric_types():
    """Check if the system handles or fails gracefully with wrong types if needed, 
    though type hints are primarily for static analysis."""
    from calculator import add
    with pytest.raises(TypeError):
        add("1", 2) # type: ignore


    # calculator.py
    def add(a: float, b: float) -> float:
        return a + b

    def subtract(a: float, b: float) -> float:
        return a - b

    def multiply(a: float, b: float) -> float:
        return a * b

    def divide(a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
    