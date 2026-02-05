// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Floating Point Precision

Description:
Floating-point numbers are not always exact. For example, `0.1 + 0.2` is slightly different from `0.3`.
Comparing them directly with `==` often fails.

The code below tries to compare `0.1 + 0.2` with `0.3`, but the assertion fails.

Your task is to fix the comparison. Instead of checking for equality, check if the difference is very small (less than `0.00001`).

Hints:
1. Use `(a - b).abs() < 0.001`
*/

fn main() {
    let a = 0.1;
    let b = 0.2;
    let c = 0.3;

    // TODO: Fix this comparison
    if (a + b) == c {
        println!("Equal!");
    } else {
        println!("Not equal!");
        panic!("They should be (approximately) equal!");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
