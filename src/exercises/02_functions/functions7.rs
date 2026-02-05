// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Early Return

Description:
The `return` keyword is most useful for returning early from a function, for example, to handle edge cases.

The function `check_number` should return `true` immediately if the number is less than 0.
Otherwise, it should perform some (simulated) heavy calculation and return `false`.

Your task is to implement the early return logic.
*/

fn main() {
    println!("-5 is safe? {}", check_number(-5));
    println!("10 is safe? {}", check_number(10));
}

fn check_number(n: i32) -> bool {
    // TODO: If n < 0, return true immediately


    // Complex calculation...
    println!("Calculating...");
    false
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
