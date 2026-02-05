// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Constants

Description:
Constants in Rust are values that are bound to a name and are not allowed to change.
Unlike variables, constants MUST always have an explicit type annotation.

The code below tries to define a constant `NUMBER` but is missing its type.

Your task is to add the correct type annotation to the constant declaration.

Hints:
1. Constants use the `const` keyword.
2. Syntax: `const NAME: TYPE = VALUE;`
*/

// TODO: Fix the constant declaration by adding a type
const NUMBER = 3;

fn main() {
    println!("Number is {}", NUMBER);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
        assert_eq!(super::NUMBER, 3);
    }
}
