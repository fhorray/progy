// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Variables - Scope

Description:
The variable `x` is defined in the inner block, but we try to access it outside.
Fix the code so it prints "Outer x is 10".

Hints:
1. Variables are only valid within the block `{}` they are declared in.
2. You can declare `x` in the outer scope.
*/

fn main() {
    {
        let x = 10;
        println!("Inner x is {}", x);
    }
    println!("Outer x is {}", x); // BUG: x is not in scope here
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
