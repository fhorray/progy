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
    /// Test a specific exercise (compiles with --test and runs tests)
    Test { name: String },
    /// List all available exercises
    List,
    /// Run the next pending exercise based on PROGRESS.md
    Next,
    /// Connect exercises to the library (for IDE support)
    Sync,
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Some(Commands::Run { name }) => {
            run_exercise(name);
        }
        Some(Commands::Test { name }) => {
            test_exercise(name);
        }
        Some(Commands::List) => {
            list_exercises();
        }
        Some(Commands::Next) => {
            run_next();
        }
        Some(Commands::Sync) => {
            sync_exercises();
        }
        None => {
            // Default behavior: run current active exercise
            if let Some(exercise) = get_current_exercise() {
                run_exercise(&exercise);
            } else {
                println!("{}", "Welcome to Rust Learning! 🦀".bold().green());
                println!();
                println!("No active exercise found.");
                println!("Use {} in Antigravity to start!", "/next".yellow());
            }
        }
    }
}

fn get_current_exercise() -> Option<String> {
    let content = fs::read_to_string("PROGRESS.md").ok()?;

    // Try to get from Active Session JSON: "exercise": "name"
    let re = Regex::new(r#""exercise":\s*"([^"]+)""#).unwrap();
    if let Some(caps) = re.captures(&content) {
        let exercise = &caps[1];
        if exercise != "null" {
            return Some(exercise.to_string());
        }
    }

    None
}

fn get_search_dirs() -> Vec<PathBuf> {
    vec![
        PathBuf::from("src/exercises"),
        PathBuf::from("src/practice"),
    ]
}

fn find_exercise(name: &str) -> Option<PathBuf> {
    for dir in get_search_dirs() {
        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("rs") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if stem == name {
                        return Some(path.to_path_buf());
                    }
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
    for dir in get_search_dirs() {
        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("rs") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    println!("- {}", stem);
                }
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

fn test_exercise(name: &str) {
    let path = match find_exercise(name) {
        Some(p) => p,
        None => {
            println!("{} Exercise '{}' not found!", "❌".red(), name);
            return;
        }
    };

    println!("{} Testing {}...", "🧪".cyan(), name);

    // Creates a temporary test binary name
    let temp_output = if cfg!(target_os = "windows") {
        "temp_test.exe"
    } else {
        "temp_test"
    };

    // Compile with --test flag
    let status = Command::new("rustc")
        .arg("--test")
        .arg(&path)
        .arg("-o")
        .arg(temp_output)
        .status();

    match status {
        Ok(s) if s.success() => {
            println!("{} Test compilation successful!", "✅".green());
            println!(
                "{}",
                "---------------------------------------------------".dimmed()
            );

            // Run tests
            let run_status = Command::new(format!("./{}", temp_output)).status();

            match run_status {
                Ok(exit) => {
                    println!(
                        "\n{}",
                        "---------------------------------------------------".dimmed()
                    );
                    if exit.success() {
                        println!("{} All tests passed!", "🎉".bold().green());

                        // Check if file has "I AM NOT DONE"
                        let content = fs::read_to_string(&path).unwrap_or_default();
                        if content.contains("// I AM NOT DONE") {
                            println!(
                                "{} Don't forget to remove '// I AM NOT DONE' when you finish!",
                                "⚠️".yellow()
                            );
                        }
                    } else {
                        println!("{} Some tests failed. See output above.", "❌".red());
                    }
                }
                Err(e) => println!("{} Failed to run tests: {}", "❌".red(), e),
            }

            // Cleanup
            let _ = fs::remove_file(temp_output);
            if cfg!(target_os = "windows") {
                let _ = fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", "")));
            }
        }
        Ok(_) => {
            println!("{} Test compilation failed. See errors above.", "❌".red());
            println!("{} Fix the code in {}", "👉".yellow(), path.display());
        }
        Err(e) => {
            println!("{} Failed to call rustc: {}", "❌".red(), e);
            println!("Make sure Rust is installed correctly.");
        }
    }
}

fn sync_exercises() {
    println!("{}", "Synchronizing exercises for IDE support...".cyan());

    // 1. Scan src/exercises to find all exercise modules
    let exercises_dir = PathBuf::from("src/exercises");
    if !exercises_dir.exists() {
        println!("{} src/exercises not found!", "❌".red());
        return;
    }

    // Map module names to their numbered directory paths
    // e.g. "variables" -> "01_variables"
    let mut modules: Vec<(String, String)> = Vec::new();

    // Iterate over top-level directories in src/exercises
    for entry in fs::read_dir(&exercises_dir).unwrap().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_dir() {
            if let Some(dir_name) = path.file_name().and_then(|n| n.to_str()) {
                // Ignore mod.rs if accidentally treated as dir, or hidden dirs
                if dir_name.starts_with('.') {
                    continue;
                }

                // Extract cleaner module name (remove number prefix if present)
                // e.g. "01_variables" -> "variables"
                let mod_name = if let Some(idx) = dir_name.find('_') {
                    if dir_name[..idx].chars().all(char::is_numeric) {
                        &dir_name[idx + 1..]
                    } else {
                        dir_name
                    }
                } else {
                    dir_name
                };

                modules.push((mod_name.to_string(), dir_name.to_string()));

                // Now generate mod.rs INSIDE this directory
                update_module_mod_rs(&path);
            }
        }
    }

    // Sort valid modules to maintain stability
    modules.sort();

    // 2. Update src/exercises/mod.rs
    let root_mod_path = exercises_dir.join("mod.rs");
    let mut content =
        String::from("// Auto-generated by `cargo run -- sync`. Do not edit manually.\n\n");

    for (mod_name, dir_name) in &modules {
        if mod_name != dir_name {
            content.push_str(&format!("#[path = \"{}/mod.rs\"]\n", dir_name));
        }
        content.push_str(&format!("pub mod {};\n\n", mod_name));
    }

    if let Err(e) = fs::write(&root_mod_path, content) {
        println!(
            "{} Failed to update {}: {}",
            "❌".red(),
            root_mod_path.display(),
            e
        );
    } else {
        println!("{} Updated {}", "✅".green(), root_mod_path.display());
    }

    println!(
        "{}",
        "Sync complete! You may need to reload your IDE."
            .bold()
            .green()
    );
}

fn update_module_mod_rs(dir_path: &PathBuf) {
    // Find all .rs files in this directory (shallow)
    let mut exercises = Vec::new();

    for entry in fs::read_dir(dir_path).unwrap().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|e| e.to_str()) == Some("rs") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                if stem != "mod" {
                    exercises.push(stem.to_string());
                }
            }
        }
    }

    exercises.sort();

    let mod_rs_path = dir_path.join("mod.rs");
    let mut content = String::from("// Auto-generated by `cargo run -- sync`\n\n");

    for ex in exercises {
        content.push_str(&format!("pub mod {};\n", ex));
    }

    if let Err(e) = fs::write(&mod_rs_path, content) {
        println!(
            "{} Failed to update {}: {}",
            "⚠️".yellow(),
            mod_rs_path.display(),
            e
        );
    }
}
