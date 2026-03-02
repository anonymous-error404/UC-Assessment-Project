import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Issue = sequelize.define(
        "Issue",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            priority: {
                type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(
                    "Open",
                    "In Progress",
                    "Resolved",
                    "Closed"
                ),
                defaultValue: "Open",
            },

            projectId: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            createdBy: {
                type: DataTypes.UUID,
                allowNull: false,
            },

            assignedTo: {
                type: DataTypes.UUID,
                allowNull: true,
            },
        },
        { tableName: "issues", timestamps: true }
    );

    return Issue;
};