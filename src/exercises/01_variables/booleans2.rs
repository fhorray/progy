// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Boolean Logic

Description:
You can combine booleans using logic operators:
- `&&` (AND): true only if BOTH are true.
- `||` (OR): true if AT LEAST ONE is true.
- `!` (NOT): inverts the boolean.

Your task is to make the expression `is_rust_fun` evaluate to `true` by changing the values of `t` and `f`.
*/

fn main() {
    let t = false;
    let f = true; // wait, this name is confusing if it's meant to be false?
    // Let's use simpler names

    // TODO: Change these values so the final expression is true
    let a = false;
    let b = false;

    // Expression: (a OR b) AND (NOT b)
    // We want this to be true.
    let is_rust_fun = (a || b) && !b;

    println!("Is Rust fun? {}", is_rust_fun);
    assert!(is_rust_fun);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
