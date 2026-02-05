// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Arrays

Description:
Sometimes you want to create an array where all elements are the same value.
Rust provides a shorthand syntax for this.

Your task is to create an array `a` with 100 elements, all initialized to `0`.

Hints:
1. Syntax: `let a = [VALUE; SIZE];`
*/

fn main() {
    // TODO: Create array `a` with 100 zeros
    let a; // Placeholder

    if a.len() == 100 && a[0] == 0 {
        println!("Success!");
    } else {
        println!("Failed!");
        panic!("Array should have 100 elements initialized to 0");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
