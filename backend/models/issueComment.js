import { DataTypes } from "sequelize";

export default (sequelize) => {
    const IssueComment = sequelize.define(
        "IssueComment",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            issueId: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            employeeId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        { tableName: "issue_comments", timestamps: true }
    );

    return IssueComment;
};