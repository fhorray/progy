// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Functions Quiz

Description:
Let's build a small calculator!

Your task is to implement the function `calculate` which:
1. Takes two integers `a` and `b`.
2. Takes a string slice `op` representing the operation ("+", "-", "*", "/").
3. Returns the result as an integer.

If the operation is not recognized, return 0.
*/

fn main() {
    let result = calculate(10, 5, "+");
    println!("10 + 5 = {}", result);
    assert_eq!(result, 15);

    let result2 = calculate(10, 5, "-");
    println!("10 - 5 = {}", result2);
    assert_eq!(result2, 5);
}

// TODO: Implement `calculate`
fn calculate(a: i32, b: i32, op: &str) -> i32 {
    0 // placeholder
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
