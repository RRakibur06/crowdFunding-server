const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Donation = require('../models/Donation');

// Make a donation
router.post('/', auth, async (req, res) => {
    try {
        const { projectId, amount } = req.body;

        // Find project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Create donation
        const donation = new Donation({
            project: projectId,
            user: req.user.id,
            amount
        });

        await donation.save();

        // Update project's current amount and add backer
        project.currentAmount += amount;

        // Check if user has backed the project before
        const backerIndex = project.backers.findIndex(
            backer => backer.user.toString() === req.user.id
        );

        if (backerIndex === -1) {
            // Add new backer
            project.backers.push({
                user: req.user.id,
                amount
            });
        } else {
            // Update existing backer's amount
            project.backers[backerIndex].amount += amount;
            project.backers[backerIndex].date = Date.now();
        }

        await project.save();

        res.json({ donation, project });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user's donations
router.get('/user', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user.id })
            .populate('project', 'title');

        res.json(donations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;