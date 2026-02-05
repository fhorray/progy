// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Multiple Parameters

Description:
Functions can take multiple parameters, separated by commas.
Each parameter must have a type annotation.

Your task is to fix the `call_me` function to accept an integer `num` and a boolean `check`.
*/

fn main() {
    call_me(10, true);
}

// TODO: Fix the parameters list
fn call_me(num: i32) {
    println!("Number: {}, Check: {}", num, check);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
