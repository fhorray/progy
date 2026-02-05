// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Variables - Mutability

Description:
In Rust, variables are immutable by default. This is a safety feature that prevents accidental changes to state.
The code below tries to reassign `x` to `20`, but the compiler will reject this because `x` was not declared as mutable.

Your task is to modify the declaration of `x` so that its value can be changed.

Hints:
1. Add the `mut` keyword after `let`.
*/

fn main() {
    let x = 10;
    println!("x is {}", x);

    // TODO: Make `x` mutable so this assignment works
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
