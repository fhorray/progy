// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Match - Destructuring

Description:
You can destructure tuples, structs, and enums inside a match pattern.

Your task is to match on a tuple `point` (x, y):
- (0, 0) => print "Origin"
- (0, y) => print "Y-axis at {}"
- (x, 0) => print "X-axis at {}"
- (x, y) => print "Coordinates: {}, {}"
*/

fn main() {
    let point = (0, 5);

    match point {
        // TODO: Add the patterns
        (0, 0) => println!("Origin"),

        // Handle (0, y)

        // Handle (x, 0)

        // Handle (x, y)
        _ => println!("Somewhere else"),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
