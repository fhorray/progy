// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Error Handling - Result

Description:
Most errors in Rust are recoverable and should be handled with `Result`.

Your task is to fix the function signature and return type to handle the error when parsing a string.
*/

fn main() {
    let numbers = vec!["42", "93", "18"];
    for number in numbers {
        match parse_number(number) {
            Ok(n) => println!("Parsed: {}", n),
            Err(e) => println!("Error: {}", e),
        }
    }
}

// TODO: Change return type to Result<i64, std::num::ParseIntError>
fn parse_number(text: &str) -> i64 {
    text.parse::<i64>().unwrap() // This unwraps, which panics on error. We want to return Result.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
