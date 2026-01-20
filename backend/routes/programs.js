const express = require("express");
const { Program, ProgramMembership } = require("../models");
const { sequelize } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get programs - role-based filtering
// global_admin: sees all non-deleted programs
// regular users: see only programs they are enrolled in
router.get("/", authenticateToken, async (req, res) => {
    try {
        const requester = req.user;
        const isGlobalAdmin = requester?.global_role === "global_admin";

        let programs;

        if (isGlobalAdmin) {
            // Global admin sees all non-deleted programs with member counts
            const [results] = await sequelize.query(`
                SELECT 
                    p.id,
                    p.name,
                    p.status,
                    p.start_date,
                    p.end_date,
                    p.is_deleted,
                    p.created_at,
                    p.updated_at,
                    COALESCE(COUNT(DISTINCT pm.member_id), 0)::int AS total_members,
                    COALESCE(COUNT(DISTINCT CASE WHEN pm.is_active = true THEN pm.member_id END), 0)::int AS active_members,
                    CASE 
                        WHEN p.start_date IS NOT NULL AND p.end_date IS NOT NULL 
                             AND p.end_date > p.start_date
                        THEN LEAST(100, GREATEST(0,
                            ((CURRENT_DATE - p.start_date)::numeric / 
                             NULLIF((p.end_date - p.start_date)::numeric, 0)) * 100
                        ))::int
                        ELSE 0
                    END AS progress_percent
                FROM programs p
                LEFT JOIN program_memberships pm ON p.id = pm.program_id
                WHERE p.is_deleted = false
                GROUP BY p.id
                ORDER BY p.start_date ASC
            `);
            programs = results;
        } else {
            // Regular user sees only programs they are enrolled in
            const [results] = await sequelize.query(`
                SELECT 
                    p.id,
                    p.name,
                    p.status,
                    p.start_date,
                    p.end_date,
                    p.is_deleted,
                    p.created_at,
                    p.updated_at,
                    COALESCE(COUNT(DISTINCT pm_all.member_id), 0)::int AS total_members,
                    COALESCE(COUNT(DISTINCT CASE WHEN pm_all.is_active = true THEN pm_all.member_id END), 0)::int AS active_members,
                    CASE 
                        WHEN p.start_date IS NOT NULL AND p.end_date IS NOT NULL 
                             AND p.end_date > p.start_date
                        THEN LEAST(100, GREATEST(0,
                            ((CURRENT_DATE - p.start_date)::numeric / 
                             NULLIF((p.end_date - p.start_date)::numeric, 0)) * 100
                        ))::int
                        ELSE 0
                    END AS progress_percent
                FROM programs p
                INNER JOIN program_memberships pm_user ON p.id = pm_user.program_id AND pm_user.member_id = :userId
                LEFT JOIN program_memberships pm_all ON p.id = pm_all.program_id
                WHERE p.is_deleted = false
                GROUP BY p.id
                ORDER BY p.start_date ASC
            `, {
                replacements: { userId: requester?.id }
            });
            programs = results;
        }

        res.json(programs);
    } catch (err) {
        console.error("Error fetching programs:", err);
        res.status(500).json({ error: "Failed to fetch programs" });
    }
});

// Create a new program - requires global_admin only
router.post("/", authenticateToken, async (req, res) => {
    try {
        const requester = req.user;

        // Only global_admin can create programs
        if (requester?.global_role !== "global_admin") {
            return res.status(403).json({ error: "Only global administrators can create programs." });
        }

        const { name, status, start_date, end_date, description } = req.body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ error: "Program name is required." });
        }

        // Validate status if provided
        const validStatuses = ["planned", "active", "completed"];
        const programStatus = status && validStatuses.includes(status) ? status : "planned";

        // Create the program
        const program = await Program.create({
            name: name.trim(),
            status: programStatus,
            start_date: start_date || null,
            end_date: end_date || null,
            description: description || null,
            is_deleted: false
        });

        res.status(201).json({
            id: program.id,
            name: program.name,
            status: program.status,
            start_date: program.start_date,
            end_date: program.end_date,
            description: program.description,
            message: "Program created successfully."
        });
    } catch (err) {
        console.error("Error creating program:", err);
        res.status(500).json({ error: "Failed to create program." });
    }
});

// Update a program - requires program admin or global_admin
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, start_date, end_date } = req.body;
        const requester = req.user;

        // Find the program (exclude deleted)
        const program = await Program.findOne({
            where: { id, is_deleted: false }
        });
        if (!program) {
            return res.status(404).json({ error: "Program not found." });
        }

        // Authorization: allow if global_admin, otherwise require admin role in the program
        if (requester?.global_role !== "global_admin") {
            const pm = await ProgramMembership.findOne({
                where: {
                    program_id: id,
                    member_id: requester?.id,
                    role: "admin"
                }
            });
            if (!pm) {
                return res.status(403).json({ error: "Admin privileges required for this program." });
            }
        }

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (status !== undefined) updateData.status = status;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        updateData.updated_at = new Date();

        await program.update(updateData);

        res.json({
            id: program.id,
            name: program.name,
            status: program.status,
            start_date: program.start_date,
            end_date: program.end_date,
            message: "Program updated successfully."
        });
    } catch (err) {
        console.error("Error updating program:", err);
        res.status(500).json({ error: "Failed to update program." });
    }
});

// Soft delete a program - requires global_admin only
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const requester = req.user;

        // Only global_admin can delete programs
        if (requester?.global_role !== "global_admin") {
            return res.status(403).json({ error: "Only global administrators can delete programs." });
        }

        // Find the program (exclude already deleted)
        const program = await Program.findOne({
            where: { id, is_deleted: false }
        });
        if (!program) {
            return res.status(404).json({ error: "Program not found." });
        }

        // Soft delete: set is_deleted = true
        await program.update({
            is_deleted: true,
            updated_at: new Date()
        });

        res.json({
            id: program.id,
            message: "Program deleted successfully."
        });
    } catch (err) {
        console.error("Error deleting program:", err);
        res.status(500).json({ error: "Failed to delete program." });
    }
});

module.exports = router;
