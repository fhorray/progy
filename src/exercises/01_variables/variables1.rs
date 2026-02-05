// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Variables - Declaration

Description:
This program is trying to print the value of `x`, but `x` is not defined.
Fix the code by binding the value `5` to `x`.

Hints:
1. Use the `let` keyword to define a variable.
*/

fn main() {
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
