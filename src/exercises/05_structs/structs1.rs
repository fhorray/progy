// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Structs - Definition

Description:
Structs are custom data types that let you name and package together multiple related values.

Your task is to define a struct named `Color` with three fields: `red`, `green`, and `blue`, all of type `i32`.
*/

// TODO: Define the struct Color
struct Color {
    red: i32,
    // Add other fields
}

fn main() {
    let green = Color {
        red: 0,
        green: 255,
        blue: 0,
    };

    println!("Green: {}, {}, {}", green.red, green.green, green.blue);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
