// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Error Handling - Panic

Description:
The simplest way to handle an error is to `panic!`. This stops the program immediately.

Your task is to make the `generate_nametag_text` function panic if the name is empty.
The message should be "Empty names aren't allowed".
*/

fn generate_nametag_text(name: String) -> String {
    if name.is_empty() {
        // TODO: Panic here
        String::new()
    } else {
        format!("Hi! My name is {}", name)
    }
}

fn main() {
    let empty = String::new();
    // generate_nametag_text(empty); // Should panic
}

#[cfg(test)]
mod tests {
    #[test]
    #[should_panic]
    fn test_main_runs() {
        super::generate_nametag_text(String::new());
    }
}
