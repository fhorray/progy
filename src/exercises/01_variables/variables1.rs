// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Variables - Declaration

Description:
Rust is a statically typed language, which means every variable must be declared before it can be used.
The code below attempts to assign the value `5` to `x`, but `x` has not been introduced to the compiler.

Your task is to properly declare `x` so that the program can store the value `5` and print it.

Hints:
1. Use the `let` keyword to bind a value to a variable name.
*/

fn main() {
    // TODO: Declare the variable `x` properly
    x = 5;
    println!("x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // We just check if it runs (compiles)
        super::main();
    }
}
