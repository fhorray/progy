// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Variables - Scope

Description:
Variables in Rust have a "scope" - they are only valid within the block `{}` where they are declared.
The variable `x` is defined inside an inner block, but the code attempts to access it in the outer block.

Your task is to fix the code so that `x` is accessible where it is used.

Hints:
1. You can declare `x` in the outer scope (before the inner block) so it remains valid.
*/

fn main() {
    {
        let x = 10;
        println!("Inner x is {}", x);
    }
    // TODO: Fix the scope of `x` so it can be printed here
    println!("Outer x is {}", x);
}

fn practice() {
    let x = 5;
    {
        let x = 10; // Shadows the outer x
        println!("Inner x is {}", x);
    }
    // Expected: 5
    println!("Outer x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
        super::practice();
    }
}
