// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - If Let Else

Description:
You can use `else` with `if let` to handle the case where the pattern doesn't match.

Your task is to fix the code to print "No number" if `arg` is `None`.
*/

fn main() {
    let arg: Option<i32> = None;

    if let Some(x) = arg {
        println!("The number is: {}", x);
    }
    // TODO: Add an else block
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
