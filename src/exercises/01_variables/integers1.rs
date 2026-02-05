// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Integers

Description:
Rust has signed (`i8`, `i16`, `i32`, `i64`, `i128`, `isize`) and unsigned (`u8`, `u16`, `u32`, `u64`, `u128`, `usize`) integers.
Each type has a specific range of values it can store.

Your task is to declare a variable `x` with the type `u8` and set it to 255.
Then declare a variable `y` with the type `i8` and set it to -128.

Hints:
1. `u8` goes from 0 to 255.
2. `i8` goes from -128 to 127.
*/

fn main() {
    // TODO: Define `x` as u8 with value 255
    let x: u8 = 0;

    // TODO: Define `y` as i8 with value -128
    let y: i8 = 0;

    println!("x: {}, y: {}", x, y);

    assert_eq!(x, 255);
    assert_eq!(y, -128);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
