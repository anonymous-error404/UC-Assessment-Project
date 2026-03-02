import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Project = sequelize.define(
        "Project",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: DataTypes.TEXT,

            managerId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        { tableName: "projects", timestamps: true }
    );

    return Project;
};