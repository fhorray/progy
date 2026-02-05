// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Lifetimes - References

Description:
Every reference in Rust has a lifetime, which is the scope for which that reference is valid.
Most of the time, lifetimes are implicit and inferred.
However, sometimes you need to annotate them explicitly.

The function `longest` takes two string slices and returns one of them.
Rust needs to know that the returned reference is valid as long as BOTH input references are valid.

Your task is to add lifetime annotations `<'a>` to the function signature.
*/

fn main() {
    let string1 = String::from("long string is long");
    let string2 = String::from("xyz");
    let result = longest(string1.as_str(), string2.as_str());
    println!("The longest string is '{}'", result);
}

// TODO: Annotate with lifetimes
// fn longest(x: &str, y: &str) -> &str {
fn longest(x: &str, y: &str) -> &str { // Fix this
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
