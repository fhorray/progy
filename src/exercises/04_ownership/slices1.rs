// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Slices - String Slices

Description:
A string slice (`&str`) is a reference to a part of a `String`.
It allows you to view a portion of the string without copying it.

Your task is to create a slice `hello` that contains "Hello" and `world` that contains "World" from `s`.
*/

fn main() {
    let s = String::from("Hello World");

    // TODO: Create the slices using range syntax [start..end]
    let hello = &s[0..0]; // Fix range
    let world = &s[0..0]; // Fix range

    println!("{} {}", hello, world);

    assert_eq!(hello, "Hello");
    assert_eq!(world, "World");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
