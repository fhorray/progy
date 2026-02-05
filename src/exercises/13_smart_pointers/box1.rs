// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Smart Pointers - Box

Description:
`Box<T>` allocates data on the heap.
It is a smart pointer that owns the data.
When the Box goes out of scope, the data is dropped.

Your task is to create a Box containing the value 5.
*/

fn main() {
    // TODO: Create a Box
    // let b = ...;

    println!("b = {}", b); // This should fail
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
