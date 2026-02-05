// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Functions - Return Type

Description:
Functions can return values. The return type is specified after `->`.

The function `is_even` is supposed to return a boolean, but the return type is missing.

Your task is to add `-> bool` to the function signature.
*/

fn main() {
    let original_price = 51;
    println!("Is {} even? {}", original_price, is_even(original_price));
}

// TODO: Add the return type
fn is_even(num: i32) {
    num % 2 == 0
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
