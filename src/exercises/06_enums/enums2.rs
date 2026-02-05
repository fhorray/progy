// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Enums - Variants with Data

Description:
Enum variants can store data, just like structs.
- `Quit`: no data
- `Echo`: String
- `Move`: anonymous struct { x: i32, y: i32 }
- `ChangeColor`: tuple (i32, i32, i32)

Your task is to define `Message` with these variants.
*/

#[derive(Debug)]
enum Message {
    // TODO: Define the variants with their data
    Quit,
    Echo,
    Move,
    ChangeColor,
}

fn main() {
    let m1 = Message::Quit;
    let m2 = Message::Echo(String::from("Hello"));
    let m3 = Message::Move { x: 10, y: 20 };
    let m4 = Message::ChangeColor(255, 0, 0);

    println!("{:?}", m1);
    println!("{:?}", m2);
    println!("{:?}", m3);
    println!("{:?}", m4);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
