import { DataTypes } from "sequelize";

export default (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: DataTypes.STRING,

            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },

            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            role: {
                type: DataTypes.ENUM("manager", "employee"),
                allowNull: false,
            },
        },
        { tableName: "users", timestamps: true }
    );

    return User;
};