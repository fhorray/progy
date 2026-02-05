// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Chars - Unicode

Description:
Since `char` is 4 bytes in Rust, it can represent much more than just ASCII.
It can represent accents, Chinese characters, emojis, etc.

Your task is to declare a variable `my_char` and assign it the '🦀' emoji (the Rust crab).

Hints:
1. `let my_char = '🦀';`
*/

fn main() {
    // TODO: Define my_char as the crab emoji
    let my_char = ' ';

    println!("Reviewer: I love {}", my_char);
    assert_eq!(my_char, '🦀');
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
