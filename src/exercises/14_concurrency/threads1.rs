// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Threads - Spawning

Description:
You can create a new thread using `std::thread::spawn`.
The spawned thread runs in parallel with the main thread.

Your task is to spawn a thread that prints "Hello from thread!".
*/

use std::thread;
use std::time::Duration;

fn main() {
    // TODO: Spawn a thread
    // thread::spawn(|| { ... });

    // Sleep to give the thread time to run (since we're not joining yet)
    thread::sleep(Duration::from_millis(100));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
