// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Tuples

Description:
Tuples are fixed-size groups of values of potentially different types.
They are useful for returning multiple values from a function.

Your task is to:
1. Create a tuple `t` containing `(500, 6.4, "Hello")`.
2. Access the second element (the float) and print it.

Hints:
1. Access tuple elements using dot notation: `t.0`, `t.1`, etc.
*/

fn main() {
    // TODO: Create the tuple `t`
    let t = (0, 0.0, "");

    // TODO: Access the second element
    let second = 0.0;

    println!("The second element is {}", second);

    assert_eq!(t.0, 500);
    assert_eq!(t.1, 6.4);
    assert_eq!(t.2, "Hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
