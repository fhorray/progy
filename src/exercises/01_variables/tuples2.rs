// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Tuples

Description:
Destructuring allows you to break a tuple into individual variables.
This is cleaner than accessing each element with `t.0`, `t.1`, etc.

Your task is to destructure the tuple `t` into variables `x`, `y`, and `z`.

Hints:
1. `let (x, y, z) = t;`
*/

fn main() {
    let t = (1, 2, 3);

    // TODO: Destructure `t` into `x`, `y`, `z`
    let (x, y, z) = (0, 0, 0);

    println!("x: {}, y: {}, z: {}", x, y, z);

    assert_eq!(x, 1);
    assert_eq!(y, 2);
    assert_eq!(z, 3);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
