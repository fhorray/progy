// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Shadowing

Description:
Rust allows you to "shadow" a variable by redeclaring it with the same name.
This is useful when you want to transform a variable but keep the name.

Fix the code to reuse `x` by shadowing it.

Hints:
1. Use `let x = ...` again to shadow the previous `x`.
*/

fn main() {
    let x = "5";
    println!("x is a string: {}", x);

    // We want to parse the string into a number
    // Fix this line:
    let x = x.parse::<i32>().unwrap();

    println!("x is now a number: {}", x + 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
