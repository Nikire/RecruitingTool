import { ApplicationStatus } from "../types/application.types";
import { HiringProcessStatus } from "../types/hiringProcess.types";
import { UserRoles } from "../types/user.types";

/**
 * Get the appropriate MUI color for an application status
 * @param status - The application status
 * @returns MUI color variant
 */
export const getApplicationStatusColor = (
  status: ApplicationStatus,
): "warning" | "info" | "success" | "error" | "default" => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "warning";
    case ApplicationStatus.REVIEWED:
      return "info";
    case ApplicationStatus.ACCEPTED:
      return "success";
    case ApplicationStatus.REJECTED:
      return "error";
    default:
      return "default";
  }
};

/**
 * Get the appropriate MUI color for a hiring process status
 * @param status - The hiring process status
 * @returns MUI color variant
 */
export const getHiringProcessStatusColor = (
  status: HiringProcessStatus,
): "primary" | "warning" | "success" | "error" | "info" | "default" => {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "primary";
    case "CLOSED":
      return "success";
    case "CANCELLED":
      return "default";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

/**
 * Get the appropriate MUI color for a user role
 * @param role - The user role
 * @returns MUI color variant
 */
export const getUserRoleColor = (
  role: UserRoles,
): "error" | "warning" | "info" | "default" => {
  switch (role) {
    case UserRoles.SUPER_ADMIN:
      return "error";
    case UserRoles.ADMIN:
      return "warning";
    case UserRoles.HR:
      return "info";
    default:
      return "default";
  }
};
