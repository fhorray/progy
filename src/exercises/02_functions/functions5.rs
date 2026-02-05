// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Implicit Return

Description:
In Rust, the last expression in a function block is the return value.
If you put a semicolon `;` at the end, it becomes a statement and returns `()` (unit type).

The function `square` is supposed to return the square of a number, but it currently returns `()`.

Your task is to remove the semicolon at the end of the function body.
*/

fn main() {
    let answer = square(3);
    println!("The square of 3 is {}", answer);
}

// TODO: Fix the return value
fn square(num: i32) -> i32 {
    num * num; // Remove this semicolon!
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
