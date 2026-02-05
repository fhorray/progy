// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Constants - Mutability

Description:
Constants are ALWAYS immutable. You cannot use `mut` with them.

The code below tries to mutate a constant.

Your task is to fix this by changing the constant into a variable (using `let`).
*/

fn main() {
    // TODO: Change this to be a mutable variable
    const X: i32 = 10;

    X = 20;

    println!("X is {}", X);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
