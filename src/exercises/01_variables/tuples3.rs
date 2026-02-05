// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Tuples

Description:
Tuples can contain other tuples.
The code below defines a nested tuple.

Your task is to access the integer `5` inside the nested tuple structure and print it.

Hints:
1. You might need multiple dot accesses like `t.1.0`.
*/

fn main() {
    let t = ((1, 2), (3, 4), 5);

    // TODO: Access the integer `5`
    let val = 0;

    println!("Value is {}", val);

    assert_eq!(val, 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
