// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Structs - Instantiation

Description:
To use a struct, you create an instance of it by specifying values for each field.
You access fields using dot notation.

Your task is to:
1. Create an instance of `Color` named `red` with values (255, 0, 0).
2. Print the red value.
*/

struct Color {
    red: i32,
    green: i32,
    blue: i32,
}

fn main() {
    // TODO: Create an instance
    // let red = ...;

    // println!("Red component is {}", red.red);
    // assert_eq!(red.red, 255);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
