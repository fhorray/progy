// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Control Flow - If/Else

Description:
The `if` statement allows you to branch your code based on a condition.
In Rust, the condition must be a boolean. You don't need parentheses around the condition.

Your task is to complete the `bigger` function.
It should return the larger of the two numbers, `a` or `b`.
*/

fn main() {
    let a = 10;
    let b = 8;
    println!("Bigger of {} and {} is {}", a, b, bigger(a, b));
    assert_eq!(bigger(a, b), 10);
    assert_eq!(bigger(32, 42), 42);
}

fn bigger(a: i32, b: i32) -> i32 {
    // TODO: Complete this function using if/else
    0
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
