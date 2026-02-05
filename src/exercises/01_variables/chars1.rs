// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Chars

Description:
The `char` type in Rust represents a Unicode Scalar Value.
It is specified with single quotes, like `'a'`, unlike strings which use double quotes.

Your task is to declare a variable `c` of type `char` and assign it the character 'z'.

Hints:
1. `let c: char = ...;`
*/

fn main() {
    // TODO: Define c as 'z'
    let c: char = ' ';

    println!("c is {}", c);
    assert_eq!(c, 'z');
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
