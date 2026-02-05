// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - If Let

Description:
`if let` is a shorter way to handle values that match one pattern while ignoring the rest.
It is useful when you only care about one case of an enum (like `Option::Some`).

Your task is to use `if let` to print "The number is: {}" if `arg` is `Some`.
*/

fn main() {
    let arg = Some(7);

    // TODO: Use if let to destructure `arg`
    // if let Some(number) = arg { ... }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
