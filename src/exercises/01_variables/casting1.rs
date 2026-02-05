// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Type Casting

Description:
Rust does not perform implicit type conversion (coercion) between primitive types (e.g. `u8` to `u32`).
You must use the `as` keyword to cast explicitly.

The code below tries to add a float `x` and an integer `y`. This fails.

Your task is to cast `x` to an integer (`i32`) so they can be added.
*/

fn main() {
    let x = 3.9;
    let y = 5;

    // TODO: Cast `x` to i32 using `as`
    let sum = x + y;

    println!("Sum is {}", sum);
    assert_eq!(sum, 8); // 3.9 as i32 becomes 3 (truncates)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
