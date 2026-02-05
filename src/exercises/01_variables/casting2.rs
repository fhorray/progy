// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Type Casting - Truncation

Description:
Casting a larger integer type to a smaller one (e.g. `u16` to `u8`) will truncate the value.
This means you lose data!

The code below casts `1000` (which fits in `u16`) to `u8` (which maxes at 255).

Your task is to:
1. Run the code and observe the result.
2. Modify the value of `big_n` so that it fits into `u8` without losing data (e.g., make it 255 or less).
*/

fn main() {
    // TODO: Change this value to something that fits in u8
    let big_n: u16 = 1000;

    let small_n = big_n as u8;

    println!("Original: {}, Casted: {}", big_n, small_n);

    assert_eq!(big_n as u8, small_n);
    // We want no data loss:
    assert_eq!(big_n, small_n as u16);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
