use clap::{Parser, Subcommand};
use colored::*;
use regex::Regex;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use walkdir::WalkDir;

#[derive(Parser)]
#[command(name = "learning")]
#[command(about = "Rust Learning Runner", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a specific exercise by name
    Run { name: String },
    /// List all available exercises
    List,
    /// Run the next pending exercise based on PROGRESS.md
    Next,
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Some(Commands::Run { name }) => {
            run_exercise(name);
        }
        Some(Commands::List) => {
            list_exercises();
        }
        Some(Commands::Next) => {
            run_next();
        }
        None => {
            // Default behavior: check PROGRESS.md and help
            println!("{}", "Welcome to Rust Learning! 🦀".bold().green());
            println!(
                "Use {} to run a specific exercise.",
                "cargo run -- run <name>".yellow()
            );
            println!("Use {} to list all.", "cargo run -- list".yellow());
            println!(
                "Use {} to run the next incomplete exercise.",
                "cargo run -- next".yellow()
            );

            // Try to suggest next
            run_next();
        }
    }
}

fn get_exercises_dir() -> PathBuf {
    PathBuf::from("src/exercises")
}

fn find_exercise(name: &str) -> Option<PathBuf> {
    for entry in WalkDir::new(get_exercises_dir())
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("rs") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                if stem == name {
                    return Some(path.to_path_buf());
                }
            }
        }
    }
    None
}

fn run_exercise(name: &str) {
    let path = match find_exercise(name) {
        Some(p) => p,
        None => {
            println!("{} Exercise '{}' not found!", "❌".red(), name);
            return;
        }
    };

    println!("{} Running {}...", "🚀".cyan(), name);

    // Creates a temporary binary name
    let temp_output = if cfg!(target_os = "windows") {
        "temp_exercise.exe"
    } else {
        "temp_exercise"
    };

    // Compile
    let status = Command::new("rustc")
        .arg(&path)
        .arg("-o")
        .arg(temp_output)
        .status();

    match status {
        Ok(s) if s.success() => {
            println!("{} Compilation successful!", "✅".green());
            println!(
                "{}",
                "---------------------------------------------------".dimmed()
            );

            // Run
            let run_status = Command::new(format!("./{}", temp_output)).status();

            match run_status {
                Ok(_) => {
                    println!(
                        "\n{}",
                        "---------------------------------------------------".dimmed()
                    );
                    println!("{} Execution completed.", "✨".green());

                    // Check if file has "I AM NOT DONE"
                    let content = fs::read_to_string(&path).unwrap_or_default();
                    if !content.contains("// I AM NOT DONE") {
                        println!("{} You have completed this exercise!", "🎉".bold().green());
                    } else {
                        println!(
                            "{} Don't forget to remove '// I AM NOT DONE' when you finish!",
                            "⚠️".yellow()
                        );
                    }
                }
                Err(e) => println!("{} Failed to execute: {}", "❌".red(), e),
            }

            // Cleanup
            let _ = fs::remove_file(temp_output);
            if cfg!(target_os = "windows") {
                let _ = fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", "")));
            }
        }
        Ok(_) => {
            println!("{} Compilation failed. See errors above.", "❌".red());
            println!("{} Fix the code in {}", "👉".yellow(), path.display());
        }
        Err(e) => {
            println!("{} Failed to call rustc: {}", "❌".red(), e);
            println!("Make sure Rust is installed correctly.");
        }
    }
}

fn list_exercises() {
    println!("{}", "Available Exercises:".bold().underline());
    for entry in WalkDir::new(get_exercises_dir())
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("rs") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                println!("- {}", stem);
            }
        }
    }
}

fn run_next() {
    // Basic implementation reading PROGRESS.md
    let progress_path = "PROGRESS.md";
    let content = match fs::read_to_string(progress_path) {
        Ok(c) => c,
        Err(_) => {
            println!("{} Could not read PROGRESS.md", "⚠️".yellow());
            return;
        }
    };

    // Look for uncompleted exercises [ ]
    let re = Regex::new(r"- \[ \] ([a-zA-Z0-9_]+)\.rs").unwrap();
    if let Some(caps) = re.captures(&content) {
        let next_exercise = &caps[1];
        println!("{} Next exercise found: {}", "👉".cyan(), next_exercise);
        run_exercise(next_exercise);
    } else {
        println!(
            "{} No pending exercises found in PROGRESS.md!",
            "🎉".green()
        );
    }
}
