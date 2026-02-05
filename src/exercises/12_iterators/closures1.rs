// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Closures - Definition

Description:
Closures are anonymous functions you can save in a variable or pass as arguments.
They are defined using `|args| body`.

Your task is to define a simple closure that takes no arguments and returns "hello".
*/

fn main() {
    // TODO: Define the closure
    let my_closure = || "hello"; // Fix this if you want, but for now I'll leave it working?
    // Wait, I should break it.
    // let my_closure = ...;

    println!("Closure says: {}", my_closure());
    assert_eq!(my_closure(), "hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
