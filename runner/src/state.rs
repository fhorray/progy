use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use anyhow::{Result, Context};
use chrono::{DateTime, Local};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LearningState {
    pub user: String,
    pub current_module: String,
    pub current_exercise: String,
    pub exercises: HashMap<String, ExerciseProgress>,
    #[serde(default)]
    pub last_session: Option<DateTime<Local>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExerciseProgress {
    pub status: ExerciseStatus,
    pub attempts: u32,
    pub started_at: Option<DateTime<Local>>,
    pub completed_at: Option<DateTime<Local>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ExerciseStatus {
    Locked,
    Pending,   // Active
    Completed,
}

impl LearningState {
    pub fn load() -> Result<Self> {
        let path = Path::new("progress.json");
        if !path.exists() {
            return Ok(Self::default());
        }

        let content = fs::read_to_string(path).context("Failed to read progress.json")?;
        let state: LearningState = serde_json::from_str(&content).context("Failed to parse progress.json")?;
        Ok(state)
    }

    pub fn save(&self) -> Result<()> {
        let content = serde_json::to_string_pretty(self)?;
        fs::write("progress.json", content).context("Failed to write progress.json")?;
        Ok(())
    }

    pub fn default() -> Self {
        Self {
            user: "Student".to_string(),
            current_module: "01_variables".to_string(),
            current_exercise: "variables1".to_string(),
            exercises: HashMap::new(),
            last_session: Some(Local::now()),
        }
    }

    pub fn mark_completed(&mut self, exercise_name: &str) {
        if let Some(ex) = self.exercises.get_mut(exercise_name) {
            ex.status = ExerciseStatus::Completed;
            ex.completed_at = Some(Local::now());
        } else {
            self.exercises.insert(exercise_name.to_string(), ExerciseProgress {
                status: ExerciseStatus::Completed,
                attempts: 1,
                started_at: Some(Local::now()),
                completed_at: Some(Local::now()),
            });
        }
    }
}
