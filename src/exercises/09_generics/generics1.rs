// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Generics

Description:
Welcome to the module on Generics!
This exercise is a placeholder to get you started.
Fix the code so it compiles.

Hints:
1. Read the error message carefully.
*/

fn main() {
    println!("Welcome to Generics!");
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
