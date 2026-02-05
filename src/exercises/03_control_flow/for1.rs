// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Control Flow - For Loop Range

Description:
The `for` loop is the most common loop in Rust.
It iterates over an iterator or a range.
Ranges are written as `start..end` (exclusive) or `start..=end` (inclusive).

Your task is to use a for loop to calculate the sum of numbers from 1 to 10 inclusive.
*/

fn main() {
    let mut sum = 0;

    // TODO: Use a for loop to iterate from 1 to 10 (inclusive)
    // for i in ... {
    //     sum += i;
    // }

    println!("Sum is {}", sum);
    assert_eq!(sum, 55);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
