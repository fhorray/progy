// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Borrowing - Immutable References

Description:
Borrowing allows you to access data without taking ownership.
You create a reference using the `&` symbol.

Your task is to create a reference `r` to `s` and print it.
*/

fn main() {
    let s = String::from("hello");

    // TODO: Create a reference `r` to `s`
    // let r = ...;

    // println!("r is {}", r);
    // println!("s is still {}", s);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
