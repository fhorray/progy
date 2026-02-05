// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Functions - Parameters

Description:
Rust functions require type annotations for all parameters.
The code below defines a function `call_me` that takes an argument, but the type is missing.

Your task is to add the type annotation for `num` (use `i32`).
*/

fn main() {
    call_me(10);
}

// TODO: Add the type for `num`
fn call_me(num) {
    println!("Number is {}", num);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
