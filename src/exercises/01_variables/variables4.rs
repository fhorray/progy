// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Constants

Description:
Constants represent values that cannot change.
However, they MUST have an explicit type annotation.

Fix the error in the constant declaration.

Hints:
1. Constants use the `const` keyword.
2. Syntax: `const NAME: TYPE = VALUE;`
*/

const NUMBER: i32 = 3;

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
