// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Ownership - Move Semantics

Description:
In Rust, every value has a single owner. When you assign a value to another variable, ownership is moved.
The original variable becomes invalid.

Your task is to fix the code so it compiles.
The code tries to use `s1` after it has been moved to `s2`.
You can fix this by using `s2` instead of `s1` in the println.
*/

fn main() {
    let s1 = String::from("hello");
    let s2 = s1;

    // TODO: Fix this usage
    println!("{}, world!", s1);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
