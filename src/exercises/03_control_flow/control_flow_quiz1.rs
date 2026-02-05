// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Control Flow Quiz - FizzBuzz

Description:
The classic FizzBuzz problem!
Print numbers from 1 to 100.
- If divisible by 3, print "Fizz"
- If divisible by 5, print "Buzz"
- If divisible by both, print "FizzBuzz"
- Otherwise, print the number.

Your task is to implement this logic in the `fizzbuzz` function which returns the string to print.
*/

fn main() {
    assert_eq!(fizzbuzz(1), "1");
    assert_eq!(fizzbuzz(3), "Fizz");
    assert_eq!(fizzbuzz(5), "Buzz");
    assert_eq!(fizzbuzz(15), "FizzBuzz");
    println!("Success!");
}

fn fizzbuzz(n: i32) -> String {
    // TODO: Implement FizzBuzz logic
    "".to_string()
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
