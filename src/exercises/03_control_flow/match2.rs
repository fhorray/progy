// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Match - Multiple Patterns

Description:
You can match multiple patterns in a single arm using the `|` operator (OR).

Your task is to modify the match expression so that:
- 2, 3, 5, 7 print "Prime"
- 1, 4, 6, 8, 9 print "Non-prime"
- Anything else prints "Unknown"
*/

fn main() {
    let number = 3;

    match number {
        // TODO: Combine these patterns
        2 => println!("Prime"),
        3 => println!("Prime"),
        5 => println!("Prime"),
        7 => println!("Prime"),
        // TODO: Handle non-primes 1, 4, 6, 8, 9

        _ => println!("Unknown"),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
