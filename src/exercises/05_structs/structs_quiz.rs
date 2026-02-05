// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Structs Quiz

Description:
Let's build a `Person` struct!
1. `new(name: String, age: u8)` -> Person
2. `birthday(&mut self)` -> increments age
3. `intro(&self)` -> prints "Hi, I'm {name} and I am {age} years old."

Your task is to implement the struct and methods.
*/

struct Person {
    name: String,
    age: u8,
}

impl Person {
    // TODO: Implement methods
}

fn main() {
    let mut p = Person::new(String::from("Alice"), 30);
    p.intro();
    p.birthday();
    p.intro();

    assert_eq!(p.age, 31);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main(); // This will fail compilation until fixed
    }
}
