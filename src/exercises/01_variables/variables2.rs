// I AM NOT DONE

/*
Difficulty: ⭐
Estimated Time: ~5 min
Topic: Variables & Primitive Types - Initialization

Description:
In Rust, the compiler ensures that variables are always initialized before use.
This is a safety feature that prevents undefined behavior.

The code below has a variable `x` that might not be initialized in all code paths.
Fix the code so that `x` is always initialized before it's used.

Expected Output:
x is 10

Execute: cargo run -- test variables2

Hints:
1. Look at the `if` statement - what happens if `condition` is false?
2. You need to ensure `x` has a value in ALL branches.
3. Either initialize `x` when declaring it, or add an `else` branch.

Learn More:
- https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html
*/

fn main() {
    let x: i32;
    let condition = true;

    if condition {
        x = 10;
    }

    println!("x is {}", x);
}

// ========== TESTS (DO NOT MODIFY BELOW THIS LINE) ==========
#[cfg(test)]
mod tests {
    #[test]
    fn test_compiles_and_runs() {
        // If this test runs, the code compiled successfully.
        super::main();
    }
}
