// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Ownership Quiz - Moves and Clones

Description:
The code below has multiple ownership errors.
Your task is to fix them all.

Rules:
- You cannot remove any `println!`.
- You can add `.clone()` or references `&`.
*/

fn main() {
    let s1 = String::from("Rust");
    let s2 = s1; // Moves s1 to s2

    println!("s1: {}", s1); // Error: s1 moved
    println!("s2: {}", s2);

    let s3 = s2; // Moves s2 to s3

    print_string(s3); // Moves s3

    println!("s3: {}", s3); // Error: s3 moved
}

fn print_string(s: String) {
    println!("Printing: {}", s);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
