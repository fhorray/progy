// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Arrays

Description:
Arrays in Rust have a fixed length and contain elements of the same type.
They are stored on the stack.

Your task is to:
1. Create an array named `a` containing the numbers 1, 2, 3, 4, 5.
2. Access the second element (index 1) and print it.

Hints:
1. Syntax: `let a = [1, 2, 3, 4, 5];`
2. Access: `a[1]`
*/

fn main() {
    // TODO: Define the array `a`
    let a = [0; 5]; // Placeholder

    println!("The second element is {}", a[1]);

    assert_eq!(a, [1, 2, 3, 4, 5]);
    assert_eq!(a[1], 2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
