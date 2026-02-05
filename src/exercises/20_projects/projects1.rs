// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Final Project

Description:
This is the final boss!
You need to implement a simple command-line tool `grep-lite`.
It should:
1. Accept a pattern and a filename as arguments.
2. Read the file.
3. Print lines that contain the pattern.

Use `std::env::args`, `std::fs::File`, `std::io::BufReader`.
Handle errors gracefully.
*/

use std::env;
use std::fs::File;
use std::io::{self, BufRead, BufReader};

struct Config {
    pattern: String,
    filename: String,
}

impl Config {
    fn new(mut args: env::Args) -> Result<Config, &'static str> {
        // Skip program name
        args.next();

        let pattern = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a pattern string"),
        };

        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file name"),
        };

        Ok(Config { pattern, filename })
    }
}

fn run(config: Config) -> Result<(), io::Error> {
    let file = File::open(config.filename)?;
    let reader = BufReader::new(file);

    for line in reader.lines() {
        let line = line?;
        if line.contains(&config.pattern) {
            println!("{}", line);
        }
    }

    Ok(())
}

fn main() {
    // This is just a skeleton.
    // In a real run, we would parse args.
    // For testing, we mock it.

    // let config = Config::new(env::args()).unwrap_or_else(|err| {
    //     eprintln!("Problem parsing arguments: {}", err);
    //     std::process::exit(1);
    // });

    // if let Err(e) = run(config) {
    //     eprintln!("Application error: {}", e);
    //     std::process::exit(1);
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
