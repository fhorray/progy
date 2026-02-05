use anyhow::Result;
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::{Backend, CrosstermBackend},
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame, Terminal,
};
use std::{io, process::Command, time::Duration};

use crate::state::LearningState;

struct App {
    state: LearningState,
    output: String,
    status_msg: String,
    scroll: u16,
}

impl App {
    fn new(state: LearningState) -> App {
        App {
            state,
            output: String::from("Press 'r' to run code. Press 'q' to quit."),
            status_msg: String::from("Ready"),
            scroll: 0,
        }
    }

    fn run_test(&mut self) {
        self.status_msg = String::from("Compiling...");
        self.output = String::from("Running tests...\n");

        // Find the file path
        // For now, simple search.
        // In a real app, we should cache paths or have a map.
        let ex_name = self.state.current_exercise.clone();
        let mut found_path = None;

        let search_dirs = vec!["src/exercises"];
        for dir in search_dirs {
            for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
                if entry.path().file_stem().map(|s| s.to_str()).flatten() == Some(ex_name.as_str()) {
                    found_path = Some(entry.path().to_path_buf());
                    break;
                }
            }
        }

        if let Some(path) = found_path {
             // Create temp test binary
             let temp_output = if cfg!(target_os = "windows") { "temp_test.exe" } else { "temp_test" };

             let compile = Command::new("rustc")
                .arg("--test")
                .arg(&path)
                .arg("-o")
                .arg(temp_output)
                .output();

             match compile {
                 Ok(output) => {
                     if output.status.success() {
                         self.output.push_str("Compilation Successful.\nExecuting...\n");
                         let run = Command::new(format!("./{}", temp_output)).output();
                         match run {
                             Ok(run_out) => {
                                 let stdout = String::from_utf8_lossy(&run_out.stdout);
                                 let stderr = String::from_utf8_lossy(&run_out.stderr);
                                 self.output.push_str(&stdout);
                                 self.output.push_str(&stderr);

                                 if run_out.status.success() {
                                     self.status_msg = String::from("Passed! Press 'n' for next.");
                                     self.state.mark_completed(&ex_name);
                                     let _ = self.state.save();
                                 } else {
                                     self.status_msg = String::from("Failed. Check output.");
                                 }
                             }
                             Err(e) => self.output.push_str(&format!("Execution error: {}", e)),
                         }
                         // Clean up
                         let _ = std::fs::remove_file(temp_output);
                         if cfg!(target_os = "windows") {
                             let _ = std::fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", "")));
                         }
                     } else {
                         self.status_msg = String::from("Compilation Failed");
                         self.output.push_str(&String::from_utf8_lossy(&output.stderr));
                     }
                 }
                 Err(e) => self.output.push_str(&format!("Rustc error: {}", e)),
             }
        } else {
            self.output = format!("Exercise {} file not found!", ex_name);
        }
    }

    fn next_exercise(&mut self) {
        // Simple logic: find current number and increment
        // In a real app with modules, this needs to be smarter.
        // For now, let's assume variables1 -> variables2

        let current = &self.state.current_exercise;
        // Parse number
        if let Some(pos) = current.find(|c: char| c.is_numeric()) {
            let prefix = &current[..pos];
            let num_str = &current[pos..];
            if let Ok(num) = num_str.parse::<u32>() {
                let next_name = format!("{}{}", prefix, num + 1);

                // Check if file exists
                let mut exists = false;
                 for dir in ["src/exercises"] {
                    for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
                        if entry.path().file_stem().map(|s| s.to_str()).flatten() == Some(&next_name) {
                            exists = true;
                            break;
                        }
                    }
                }

                if exists {
                    self.state.current_exercise = next_name;
                    self.status_msg = format!("Loaded {}", self.state.current_exercise);
                    self.output = String::from("New exercise loaded. Read the file, solve it, then press 'r'.");
                    let _ = self.state.save();
                } else {
                     // Try next module? Or just say done.
                     self.status_msg = String::from("No more exercises in this series!");
                }
            }
        }
    }
}

pub fn run_tui() -> Result<()> {
    // Setup terminal
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // Load state
    let state = LearningState::load()?;
    let mut app = App::new(state);

    let res = run_app(&mut terminal, &mut app);

    // Restore terminal
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;

    if let Err(err) = res {
        println!("{:?}", err);
    }

    Ok(())
}

fn run_app<B: Backend>(terminal: &mut Terminal<B>, app: &mut App) -> io::Result<()> {
    loop {
        terminal.draw(|f| ui(f, app))?;

        if event::poll(Duration::from_millis(250))? {
            if let Event::Key(key) = event::read()? {
                match key.code {
                    KeyCode::Char('q') => return Ok(()),
                    KeyCode::Char('r') => app.run_test(),
                    KeyCode::Char('n') => app.next_exercise(),
                    KeyCode::Char('j') | KeyCode::Down => {
                         if app.scroll < 1000 { app.scroll += 1; }
                    }
                    KeyCode::Char('k') | KeyCode::Up => {
                         if app.scroll > 0 { app.scroll -= 1; }
                    }
                    _ => {}
                }
            }
        }
    }
}

fn ui(f: &mut Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints(
            [
                Constraint::Length(3),
                Constraint::Min(0),
                Constraint::Length(3),
            ]
            .as_ref(),
        )
        .split(f.size());

    // Title Block
    let title = Paragraph::new(format!("Rust Learning Flow - User: {}", app.state.user))
        .block(Block::default().borders(Borders::ALL).style(Style::default().fg(Color::Cyan)));
    f.render_widget(title, chunks[0]);

    // Main Content (Split Horizontal)
    let main_chunks = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(30), Constraint::Percentage(70)].as_ref())
        .split(chunks[1]);

    // Sidebar (Info)
    let info_text = vec![
        Line::from(Span::styled("Current Module:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.state.current_module.as_str()),
        Line::from(""),
        Line::from(Span::styled("Exercise:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.state.current_exercise.as_str()),
        Line::from(""),
        Line::from(Span::styled("Status:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.status_msg.as_str()),
    ];
    let sidebar = Paragraph::new(info_text)
        .block(Block::default().title("Info").borders(Borders::ALL));
    f.render_widget(sidebar, main_chunks[0]);

    // Output Area
    let output = Paragraph::new(app.output.clone())
        .block(Block::default().title("Output").borders(Borders::ALL))
        .wrap(Wrap { trim: true })
        .scroll((app.scroll, 0));
    f.render_widget(output, main_chunks[1]);

    // Bottom Bar (Help)
    let help_text = "q: Quit | r: Run/Test | n: Next Exercise | j/k: Scroll";
    let help = Paragraph::new(help_text)
        .style(Style::default().fg(Color::Yellow))
        .block(Block::default().borders(Borders::ALL));
    f.render_widget(help, chunks[2]);
}
