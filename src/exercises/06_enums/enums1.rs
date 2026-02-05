// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Enums - Definition

Description:
Enums allow you to define a type by enumerating its possible variants.

Your task is to define an enum named `Message` with four variants:
- `Quit`
- `Echo`
- `Move`
- `ChangeColor`
*/

// TODO: Define the enum `Message`
enum Message {
    // Add variants here
}

fn main() {
    let msg1 = Message::Quit;
    let msg2 = Message::Echo;
    let msg3 = Message::Move;
    let msg4 = Message::ChangeColor;

    // Note: To print them, we usually need #[derive(Debug)]
    // println!("We have messages");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
