// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Testing - Assertions

Description:
Tests are Rust functions that verify that the non-test code is functioning in the expected manner.
The bodies of test functions typically perform some setup, run the code we want to test, then assert whether the result is what we expect.

Your task is to fix the test so it passes.
`assert!` checks that the boolean expression is true.
*/

#[cfg(test)]
mod tests {
    #[test]
    fn you_can_assert() {
        // TODO: Fix the assertion
        assert!(1 == 2);
    }
}
