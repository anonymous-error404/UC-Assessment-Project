import * as projectService from "../services/project.service.js";

export const createProject = async (req, res) => {
    try {
        console.log(req.user.userId);
        const project = await projectService.createProject(
            req.body,
            req.user.userId
        );
        res.status(201).json(project);
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ message: "Some error occured while creating project" });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await projectService.getProjects();
        res.json(projects);
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: "Error getting projects" });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        res.json(project);
    } catch (err) {
        console.log(err.message)
        res.status(404).json({ message: "Project not found" });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project = await projectService.updateProject(
            req.params.id,
            req.body
        );
        res.json(project);
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ message: "Error updating project" });
    }
};

export const deleteProject = async (req, res) => {
    try {
        await projectService.deleteProject(req.params.id);
        res.json({ message: "Project deleted" });
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ message: "Error deleting project" });
    }
};