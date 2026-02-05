// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Match - Ranges

Description:
You can match ranges of values using `..=`.

Your task is to categorize ages:
- 0 to 12: "Child"
- 13 to 19: "Teenager"
- 20 to 64: "Adult"
- 65 and up: "Senior" (Use the catch-all `_` for 65+)
*/

fn main() {
    let age = 15;

    match age {
        // TODO: Use ranges to handle cases
        // 0..=12 => ...
        _ => println!("Unknown age"),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
