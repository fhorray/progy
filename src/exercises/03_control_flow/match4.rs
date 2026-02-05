// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Match - Expression

Description:
Like `if`, `match` is an expression and returns a value.
All arms must return the same type.

The code below tries to assign the result of a match to `message`.
However, it's missing the assignment part.

Your task is to assign the result of the match to `message`.
*/

fn main() {
    let boolean = true;

    // TODO: Assign the result to `message`
    match boolean {
        true => "It's true!",
        false => "It's false!",
    };

    // println!("{}", message); // This will fail because message is not defined
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
