import { Goal } from "../types/goal";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const MAX_GOALS = 8;
export const MIN_WEIGHTAGE_PER_GOAL = 10;
export const REQUIRED_TOTAL_WEIGHTAGE = 100;

/**
 * Validates a single goal's constraints (e.g., minimum weightage).
 */
export function validateGoal(goal: Partial<Goal>): ValidationResult {
  const errors: string[] = [];

  if (!goal.title || goal.title.trim() === "") {
    errors.push("Goal title is required.");
  }
  if (!goal.thrustArea) {
    errors.push("Thrust Area is required.");
  }
  if (goal.weightage === undefined || goal.weightage < MIN_WEIGHTAGE_PER_GOAL) {
    errors.push(`Weightage must be at least ${MIN_WEIGHTAGE_PER_GOAL}%.`);
  }
  if (goal.target === undefined || goal.target === null) {
    errors.push("Target value is required.");
  }
  
  if (goal.uom === "zero" && goal.target !== 0) {
    errors.push("Zero-based goals must have a target of 0.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates the entire goal sheet for an employee.
 * Ensures total weightage is exactly 100% and max goals limit is respected.
 */
export function validateGoalSheet(goals: Goal[]): ValidationResult {
  const errors: string[] = [];
  
  if (goals.length > MAX_GOALS) {
    errors.push(`Maximum of ${MAX_GOALS} goals allowed. You have ${goals.length}.`);
  }

  const totalWeightage = goals.reduce((sum, g) => sum + (g.weightage || 0), 0);
  
  if (totalWeightage !== REQUIRED_TOTAL_WEIGHTAGE) {
    errors.push(`Total weightage must be exactly ${REQUIRED_TOTAL_WEIGHTAGE}%. Current total: ${totalWeightage}%.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Special validator for Manager inline edits. 
 * Re-validates the sheet ensuring a manager doesn't bypass the 100% rule.
 */
export function validateManagerEdits(originalGoals: Goal[], updatedGoals: Goal[]): ValidationResult {
  // We just run the same sheet validation, but this helper clarifies intent
  // and gives a hook if manager validation rules differ later.
  return validateGoalSheet(updatedGoals);
}
