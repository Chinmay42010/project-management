export const UserRoleEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

export const AvailableUserRole = Object.values(UserRoleEnum)

export const TaskStatusEnum = {
    TODO:"tod0",
    IN_PROGRESS: "in_progress",
    DONE: "done"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum)