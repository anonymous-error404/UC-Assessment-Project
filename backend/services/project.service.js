import { Project, Issue, User } from "../models/index.js";

//// CREATE PROJECT ////
export const createProject = async (data, managerId) => {
    const project = await Project.create({
        ...data,
        managerId,
    });
    return project;
};

//// GET ALL PROJECTS ////
export const getProjects = async () => {
    return await Project.findAll({
        include: [
            {
                model: User,
                as: "manager",
                attributes: ["id", "name", "email"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
};

//// GET PROJECT BY ID ////
export const getProjectById = async (id) => {
    const project = await Project.findByPk(id, {
        include: [
            {
                model: User,
                as: "manager",
                attributes: ["name"],
            },
            {
                model: Issue,
            },
        ],
    });

    if (!project) throw new Error("Project not found");
    return project;
};

//// UPDATE PROJECT ////
export const updateProject = async (id, data) => {
    const project = await Project.findByPk(id);
    if (!project) throw new Error("Project not found");

    await project.update(data);
    return project;
};

//// DELETE PROJECT ////
export const deleteProject = async (id) => {
    const project = await Project.findByPk(id);
    if (!project) throw new Error("Project not found");

    await project.destroy();
};