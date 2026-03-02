import sequelize from "../config/postgres.config.js";

import UserModel from "./user.js";
import ProjectModel from "./projects.js";
import IssueModel from "./issue.js";
import IssueCommentModel from "./issueComment.js";

const User = UserModel(sequelize);
const Project = ProjectModel(sequelize);
const Issue = IssueModel(sequelize);
const IssueComment = IssueCommentModel(sequelize);

//// RELATIONS //////

// 🔹 Manager owns projects
User.hasMany(Project, {
    foreignKey: "managerId",
    as: "managedProjects",
});
Project.belongsTo(User, {
    foreignKey: "managerId",
    as: "manager",
});

// 🔹 Project has many issues
Project.hasMany(Issue, { foreignKey: "projectId" });
Issue.belongsTo(Project, { foreignKey: "projectId" });

// 🔹 Issue created by user
User.hasMany(Issue, {
    foreignKey: "createdBy",
    as: "createdIssues",
});
Issue.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
});

// 🔹 Issue assigned to user
User.hasMany(Issue, {
    foreignKey: "assignedTo",
    as: "assignedIssues",
});
Issue.belongsTo(User, {
    foreignKey: "assignedTo",
    as: "assignee",
});

// 🔹 Issue comments
Issue.hasMany(IssueComment, { foreignKey: "issueId" });
IssueComment.belongsTo(Issue, { foreignKey: "issueId" });

// 🔹 Comment author
User.hasMany(IssueComment, { foreignKey: "employeeId" });
IssueComment.belongsTo(User, {
    foreignKey: "employeeId",
    as: "commenter",
});

export {
    sequelize,
    User,
    Project,
    Issue,
    IssueComment,
};