// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Arrays

Description:
Accessing an array index that is out of bounds causes a panic at runtime.
However, if you can determine the length at compile time, the compiler might stop you.

The code below tries to access the 10th element of an array of size 5.

Your task is to make the code safe. You can either:
1. Change the index to be within bounds.
2. Or use the `.get()` method which returns an `Option`.

For this exercise, use `.get()` and handle the `None` case by printing "Out of bounds".

Hints:
1. `array.get(index)` returns `Some(&value)` or `None`.
*/

fn main() {
    let a = [10, 20, 30, 40, 50];
    let index = 10;

    // TODO: Use `.get()` instead of direct indexing to handle the error gracefully
    // Hint: `array.get(index)` returns `Some(&value)` or `None`
    // Handle each case with `match` or `if let`
    println!("Value: {}", a[index]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
