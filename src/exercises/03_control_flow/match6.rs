// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Match - Guards

Description:
A match guard is an extra `if` condition specified after the pattern.
The arm matches only if the pattern matches AND the condition is true.

Your task is to use a match guard to print "Big number" if the number is greater than 100.
*/

fn main() {
    let number = 150;

    match number {
        // TODO: Add a match guard here
        // x ... => println!("Big number: {}", x),

        x => println!("Small number: {}", x),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
