
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('creator', 'name')
            .populate('backers.user', 'name');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create project
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, goalAmount, endDate, imageUrl } = req.body;

        const newProject = new Project({
            title,
            description,
            goalAmount,
            endDate,
            imageUrl,
            creator: req.user.id
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add project update
router.post('/:id/updates', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user is project creator
        if (project.creator.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        project.updates.unshift({ content });
        await project.save();

        res.json(project.updates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;