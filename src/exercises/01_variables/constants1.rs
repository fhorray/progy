// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Constants

Description:
Constants can be declared in the global scope (outside functions).
They are computed at compile time.

Your task is to declare a global constant `MAX_POINTS` equal to `100_000` and use it in main.
*/

// TODO: Define the constant MAX_POINTS
// const MAX_POINTS: u32 = ...;

fn main() {
    println!("Max points: {}", MAX_POINTS);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
