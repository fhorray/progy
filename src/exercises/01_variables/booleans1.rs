// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Booleans

Description:
Booleans (`bool`) can only be `true` or `false`.
They are often used in control flow.

Your task is to:
1. Assign `true` to `is_morning`.
2. Assign `false` to `is_evening`.
*/

fn main() {
    // TODO: Set to true
    let is_morning = false;

    // TODO: Set to false
    let is_evening = true;

    if is_morning {
        println!("Good morning!");
    }

    if is_evening {
        println!("Good evening!");
    }

    assert!(is_morning);
    assert!(!is_evening);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
