// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Methods - Definition

Description:
Methods are functions defined within the context of a struct (or enum/trait object).
They always take `self` as the first parameter.

Your task is to implement the `area` method for `Rectangle` which returns its area (width * height).
*/

struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO: Implement `area` method
    // fn area(&self) -> u32 { ... }
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect.area() // This call will fail
    );

    // assert_eq!(rect.area(), 1500);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
