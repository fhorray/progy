// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Iterators - Basics

Description:
Iterators allow you to perform a task on a sequence of items.
You create an iterator by calling `.iter()` on a collection.

Your task is to create an iterator for `v` and print the first element.
*/

fn main() {
    let v = vec![1, 2, 3];

    // TODO: Create iterator
    let mut iter = v.iter();

    // TODO: Print the first item
    println!("First: {:?}", iter.next());

    // Check next item
    assert_eq!(iter.next(), Some(&2));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
