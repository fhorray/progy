// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Ownership - Move

Description:
Strings are heap-allocated, so they are not `Copy`.
When you assign `s1` to `s2`, `s1` is invalidated.

Your task is to fix the error by cloning `s1` so that `s2` gets a copy, and `s1` remains valid.
*/

fn main() {
    let s1 = String::from("hello");

    // TODO: Use .clone() here
    let s2 = s1;

    println!("s1 = {}, s2 = {}", s1, s2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
