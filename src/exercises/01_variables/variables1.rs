// I AM NOT DONE

/*
Difficulty: ⭐
Estimated Time: ~5 min
Topic: Variables & Primitive Types - Mutability

Description:
In Rust, variables are immutable by default. This means once you assign a value
to a variable, you cannot change it unless you explicitly mark it as mutable.

The code below tries to reassign a value to `x`, but it won't compile because
`x` is immutable. Fix the code so that `x` can be reassigned.

Expected Output:
x is 5
x is 6

Execute: cargo run -- test variables1

Hints:
1. Variables in Rust are immutable by default.
2. To make a variable mutable, use the `mut` keyword.
3. The syntax is: `let mut x = 5;`

Learn More:
- https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html
*/

fn main() {
    let x = 5;
    println!("x is {}", x);
    x = 6;
    println!("x is {}", x);
}

// ========== TESTS (DO NOT MODIFY BELOW THIS LINE) ==========
#[cfg(test)]
mod tests {
    #[test]
    fn test_compiles_and_runs() {
        // If this test runs, the code compiled successfully.
        // The main() function must execute without panicking.
        super::main();
    }
}
