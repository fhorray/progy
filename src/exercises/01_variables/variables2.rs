// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Variables - Mutability

Description:
The code attempts to change the value of `x`, but the compiler forbids it.
Make `x` mutable to allow this.

Hints:
1. Variables in Rust are immutable by default.
2. Add the `mut` keyword after `let`.
*/

fn main() {
    let x = 10;
    println!("x is {}", x);
    x = 20;
    println!("x is now {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
