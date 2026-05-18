export type GoalStatus = 
  | "draft" 
  | "submitted" 
  | "manager_review" 
  | "returned" 
  | "locked";

export type CheckinStatus = 
  | "not_started" 
  | "on_track" 
  | "completed";

export type SharedGoalInfo = {
  isPrimary: boolean;
  primaryOwnerId?: string;
  linkedUsers?: string[];
};

export type BaseGoal = {
  id: string;
  employeeId: string;
  managerId: string;
  status: GoalStatus;
  checkinStatus: CheckinStatus;
  thrustArea: string;
  title: string;
  description: string;
  weightage: number;
  sharedGoal?: SharedGoalInfo;
};

export type NumericGoal = BaseGoal & {
  uom: "numeric" | "percentage";
  evaluationType: "min" | "max";
  target: number;
  actual?: number;
};

export type TimelineGoal = BaseGoal & {
  uom: "timeline";
  target: Date;
  actual?: Date;
};

export type ZeroGoal = BaseGoal & {
  uom: "zero";
  target: 0;
  actual?: number;
};

export type Goal = NumericGoal | TimelineGoal | ZeroGoal;

// Helper to check if a goal can be edited by the user
export function isGoalEditable(goal: Goal, isManager: boolean = false): boolean {
  if (goal.status === "locked") return false;
  if (isManager && goal.status === "manager_review") return true;
  if (!isManager && (goal.status === "draft" || goal.status === "returned")) return true;
  return false;
}
