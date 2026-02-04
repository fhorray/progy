// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Return Values

Description:
Complete the `bigger` function to return the larger of two numbers.
If both numbers are equal, return either one.

Do not use:
- Additional variables
- Other function calls

Hints:
1. Use an if/else expression.
2. In Rust, the last expression in a block is returned (no semicolon needed).
3. The syntax is: if condition { value1 } else { value2 }
*/

fn bigger(a: i32, b: i32) -> i32 {
    // TODO: Implement this function
}

fn main() {
    // You can experiment here
    println!("The bigger of 10 and 8 is: {}", bigger(10, 8));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ten_is_bigger_than_eight() {
        assert_eq!(10, bigger(10, 8));
    }

    #[test]
    fn fortytwo_is_bigger_than_thirtytwo() {
        assert_eq!(42, bigger(32, 42));
    }

    #[test]
    fn equal_numbers() {
        assert_eq!(42, bigger(42, 42));
    }

    #[test]
    fn negative_numbers() {
        assert_eq!(-1, bigger(-1, -5));
    }
}
