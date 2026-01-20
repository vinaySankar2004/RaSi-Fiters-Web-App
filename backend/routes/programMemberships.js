const express = require("express");
const { Member, Program, ProgramMembership } = require("../models");
const { sequelize } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Helper to generate a unique username based on member_name
const generateUniqueUsername = async (baseName, transaction) => {
    const slug = (baseName || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        || "user";

    let candidate = slug;
    let counter = 1;
    while (counter < 1000) {
        const exists = await Member.findOne({ where: { username: candidate }, transaction });
        if (!exists) {
            return candidate;
        }
        candidate = `${slug}${counter}`;
        counter += 1;
    }
    throw new Error("Unable to generate unique username");
};

// POST /program-memberships : create member + enroll to program (new endpoint, non-breaking)
router.post("/", authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { member_name, password, program_id, gender, date_of_birth, date_joined, role, is_active } = req.body;
        const requester = req.user;

        if (!member_name || !password || !program_id) {
            await transaction.rollback();
            return res.status(400).json({ error: "member_name, password, and program_id are required." });
        }

        // Authorization: allow if global_admin, otherwise require admin role in the program_memberships row for requester.
        if (requester?.global_role !== "global_admin") {
            const pm = await ProgramMembership.findOne({
                where: {
                    program_id,
                    member_id: requester?.id,
                    role: "admin"
                },
                transaction
            });
            if (!pm) {
                await transaction.rollback();
                return res.status(403).json({ error: "Admin privileges required." });
            }
        }

        const program = await Program.findOne({
            where: { id: program_id, is_deleted: false },
            transaction
        });
        if (!program) {
            await transaction.rollback();
            return res.status(404).json({ error: "Program not found." });
        }

        const username = await generateUniqueUsername(member_name, transaction);

        const newMember = await Member.create({
            member_name,
            username,
            password,
            gender,
            date_of_birth,
            date_joined: date_joined || new Date().toISOString().slice(0, 10),
            role: 'member'
        }, { transaction });

        await ProgramMembership.create({
            program_id,
            member_id: newMember.id,
            role: role || 'member',
            joined_at: date_joined || new Date().toISOString().slice(0, 10),
            is_active: is_active !== undefined ? is_active : true
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            id: newMember.id,
            member_name: newMember.member_name,
            username: newMember.username,
            gender: newMember.gender,
            date_of_birth: newMember.date_of_birth,
            date_joined: newMember.date_joined,
            role: newMember.role,
            program_id
        });
    } catch (err) {
        await transaction.rollback();
        console.error("Error adding member to program:", err);
        const message = err.message === "Unable to generate unique username"
            ? "Failed to generate unique username."
            : "Failed to add member.";
        res.status(500).json({ error: message });
    }
});

// GET /program-memberships/members?programId=... : members in a program
router.get("/members", authenticateToken, async (req, res) => {
    try {
        const { programId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const memberships = await ProgramMembership.findAll({
            where: { program_id: programId },
            include: [
                {
                    model: Member,
                    attributes: ["id", "member_name", "username", "gender", "date_of_birth", "date_joined", "role", "global_role"]
                }
            ],
            order: [[Member, "member_name", "ASC"]]
        });

        const members = memberships
            .map((m) => m.Member)
            .filter(Boolean);

        res.json(members);
    } catch (err) {
        console.error("Error fetching program members:", err);
        res.status(500).json({ error: "Failed to fetch program members." });
    }
});

// GET /program-memberships/available?programId=... : members NOT in the specified program
router.get("/available", authenticateToken, async (req, res) => {
    try {
        const { programId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        // Get IDs of members already in the program
        const existingMemberships = await ProgramMembership.findAll({
            where: { program_id: programId },
            attributes: ["member_id"]
        });
        const enrolledMemberIds = existingMemberships.map((m) => m.member_id);

        // Find all members NOT in the program (exclude admins by global_role)
        const { Op } = require("sequelize");
        const whereClause = {
            role: "member" // Only include regular members, not legacy admins
        };

        if (enrolledMemberIds.length > 0) {
            whereClause.id = { [Op.notIn]: enrolledMemberIds };
        }

        const availableMembers = await Member.findAll({
            where: whereClause,
            attributes: ["id", "member_name", "username", "gender", "date_of_birth", "date_joined"],
            order: [["member_name", "ASC"]]
        });

        res.json(availableMembers);
    } catch (err) {
        console.error("Error fetching available members:", err);
        res.status(500).json({ error: "Failed to fetch available members." });
    }
});

// GET /program-memberships/details?programId=... : members with membership details (role, is_active, joined_at)
router.get("/details", authenticateToken, async (req, res) => {
    try {
        const { programId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const memberships = await ProgramMembership.findAll({
            where: { program_id: programId },
            include: [
                {
                    model: Member,
                    attributes: ["id", "member_name", "username", "gender", "date_of_birth", "date_joined", "global_role"]
                }
            ],
            order: [[Member, "member_name", "ASC"]]
        });

        // Return combined member + membership data
        const result = memberships
            .filter((m) => m.Member)
            .map((m) => ({
                member_id: m.Member.id,
                member_name: m.Member.member_name,
                username: m.Member.username,
                gender: m.Member.gender,
                date_of_birth: m.Member.date_of_birth,
                date_joined: m.Member.date_joined,
                global_role: m.Member.global_role,
                program_role: m.role,
                is_active: m.is_active,
                joined_at: m.joined_at
            }));

        res.json(result);
    } catch (err) {
        console.error("Error fetching program membership details:", err);
        res.status(500).json({ error: "Failed to fetch program membership details." });
    }
});

// POST /program-memberships/enroll : enroll an existing member into a program
router.post("/enroll", authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { member_id, program_id, role, joined_at, is_active } = req.body;
        const requester = req.user;

        if (!member_id || !program_id) {
            await transaction.rollback();
            return res.status(400).json({ error: "member_id and program_id are required." });
        }

        // Authorization: allow if global_admin, otherwise require admin role in the program
        if (requester?.global_role !== "global_admin") {
            const pm = await ProgramMembership.findOne({
                where: {
                    program_id,
                    member_id: requester?.id,
                    role: "admin"
                },
                transaction
            });
            if (!pm) {
                await transaction.rollback();
                return res.status(403).json({ error: "Admin privileges required." });
            }
        }

        // Check if program exists
        const program = await Program.findOne({
            where: { id: program_id, is_deleted: false },
            transaction
        });
        if (!program) {
            await transaction.rollback();
            return res.status(404).json({ error: "Program not found." });
        }

        // Check if member exists
        const member = await Member.findByPk(member_id, { transaction });
        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ error: "Member not found." });
        }

        // Check if member is already enrolled in the program
        const existingMembership = await ProgramMembership.findOne({
            where: { program_id, member_id },
            transaction
        });
        if (existingMembership) {
            await transaction.rollback();
            return res.status(400).json({ error: "Member is already enrolled in this program." });
        }

        // Create the program membership
        await ProgramMembership.create({
            program_id,
            member_id,
            role: role || "member",
            joined_at: joined_at || new Date().toISOString().slice(0, 10),
            is_active: is_active !== undefined ? is_active : true
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            member_id: member.id,
            member_name: member.member_name,
            username: member.username,
            gender: member.gender,
            date_of_birth: member.date_of_birth,
            date_joined: member.date_joined,
            program_id,
            message: "Member enrolled successfully."
        });
    } catch (err) {
        await transaction.rollback();
        console.error("Error enrolling member to program:", err);
        res.status(500).json({ error: "Failed to enroll member." });
    }
});

// PUT /program-memberships : update membership (role, is_active, joined_at)
router.put("/", authenticateToken, async (req, res) => {
    try {
        const { program_id, member_id, role, is_active, joined_at } = req.body;
        const requester = req.user;

        if (!program_id || !member_id) {
            return res.status(400).json({ error: "program_id and member_id are required." });
        }

        // Authorization: allow if global_admin, otherwise require admin role in the program
        if (requester?.global_role !== "global_admin") {
            const pm = await ProgramMembership.findOne({
                where: {
                    program_id,
                    member_id: requester?.id,
                    role: "admin"
                }
            });
            if (!pm) {
                return res.status(403).json({ error: "Admin privileges required for this program." });
            }
        }

        // Find the membership
        const membership = await ProgramMembership.findOne({
            where: { program_id, member_id }
        });

        if (!membership) {
            return res.status(404).json({ error: "Membership not found." });
        }

        // Build update object with only provided fields
        const updateData = {};
        if (role !== undefined) updateData.role = role;
        if (is_active !== undefined) updateData.is_active = is_active;
        if (joined_at !== undefined) updateData.joined_at = joined_at;

        await membership.update(updateData);

        // Fetch member info for response
        const member = await Member.findByPk(member_id);

        res.json({
            program_id: membership.program_id,
            member_id: membership.member_id,
            member_name: member?.member_name,
            role: membership.role,
            is_active: membership.is_active,
            joined_at: membership.joined_at,
            message: "Membership updated successfully."
        });
    } catch (err) {
        console.error("Error updating membership:", err);
        res.status(500).json({ error: "Failed to update membership." });
    }
});

// DELETE /program-memberships : remove member from program
router.delete("/", authenticateToken, async (req, res) => {
    try {
        const { program_id, member_id } = req.body;
        const requester = req.user;

        if (!program_id || !member_id) {
            return res.status(400).json({ error: "program_id and member_id are required." });
        }

        // Authorization: allow if global_admin, otherwise require admin role in the program
        if (requester?.global_role !== "global_admin") {
            const pm = await ProgramMembership.findOne({
                where: {
                    program_id,
                    member_id: requester?.id,
                    role: "admin"
                }
            });
            if (!pm) {
                return res.status(403).json({ error: "Admin privileges required for this program." });
            }
        }

        // Prevent self-removal if it would leave no admins
        if (member_id === requester?.id) {
            const adminCount = await ProgramMembership.count({
                where: { program_id, role: "admin" }
            });
            if (adminCount <= 1) {
                return res.status(400).json({ error: "Cannot remove the last admin from the program." });
            }
        }

        // Find and delete the membership
        const membership = await ProgramMembership.findOne({
            where: { program_id, member_id }
        });

        if (!membership) {
            return res.status(404).json({ error: "Membership not found." });
        }

        await membership.destroy();

        res.json({ message: "Member removed from program successfully." });
    } catch (err) {
        console.error("Error removing member from program:", err);
        res.status(500).json({ error: "Failed to remove member from program." });
    }
});

module.exports = router;
