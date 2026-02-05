// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Unsafe Rust - Dereferencing Raw Pointers

Description:
Unsafe Rust allows you to dereference raw pointers (`*const T` and `*mut T`).
This is unsafe because the pointer might be null, dangling, or unaligned.

Your task is to dereference the raw pointer `r1` inside an `unsafe` block.
*/

fn main() {
    let mut num = 5;

    let r1 = &num as *const i32;
    let r2 = &mut num as *mut i32;

    // TODO: Dereference r1 inside unsafe block
    // unsafe {
    //     println!("r1 is: {}", *r1);
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
