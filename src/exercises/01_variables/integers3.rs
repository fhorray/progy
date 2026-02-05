// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Numeric Literals

Description:
Rust supports different ways to write numbers:
- Decimal: `98_222`
- Hex: `0xff`
- Octal: `0o77`
- Binary: `0b1111_0000`
- Byte (u8 only): `b'A'`

Your task is to define variable `x` as `100` using a decimal literal,
and variable `y` as `255` using a hex literal.

Hints:
1. Hex literals start with `0x`.
*/

fn main() {
    // TODO: Define x as 100
    let x = 0;

    // TODO: Define y as 255 using hex
    let y = 0x00;

    println!("x: {}, y: {}", x, y);

    assert_eq!(x, 100);
    assert_eq!(y, 255);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
