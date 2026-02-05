// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Generics - Definition

Description:
Generics allow you to write code that works with multiple types.
`Vec<T>` is a generic type where `T` is the type of elements.

Your task is to create a vector of strings.
*/

fn main() {
    // TODO: Create a vector of strings
    let v: Vec<String> = Vec::new(); // Fix this

    // v.push("hello"); // Type mismatch if v is Vec<i32> for example
    // v.push(String::from("hello"));

    println!("{:?}", v);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
