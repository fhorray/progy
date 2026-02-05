// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Loops

Description:
The `loop` keyword creates an infinite loop.
You must use the `break` keyword to exit the loop.

Your task is to modify the loop so it breaks when `count` reaches 10.
*/

fn main() {
    let mut count = 0;

    loop {
        count += 1;
        println!("Count: {}", count);

        if count == 10 {
            // TODO: Break the loop here
        }
    }

    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
