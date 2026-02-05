// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Final Project

Description:
Welcome to the module on Final Project!
This exercise is a placeholder to get you started.
Fix the code so it compiles.

Hints:
1. Read the error message carefully.
*/

fn main() {
    println!("Welcome to Final Project!");
    let x = 1;
    // Fix this condition to be true
    if x > 100 {
        println!("This won't print");
    } else {
        println!("Success!");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
