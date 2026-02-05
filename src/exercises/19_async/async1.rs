// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Async - Future

Description:
Async functions return a `Future`.
To run a future, you need an executor (like `tokio`) or use `.await` inside another async function.

Your task is to define an async function `hello` that returns "world".
*/

use std::future::Future;

// TODO: Define async function
// async fn hello() -> &'static str { ... }

fn main() {
    // let future = hello();
    // In a real async runtime, we would await this.
    // Here we just check the type.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
