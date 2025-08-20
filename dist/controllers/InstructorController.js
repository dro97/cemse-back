"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInstructors = listInstructors;
exports.getInstructor = getInstructor;
exports.createInstructor = createInstructor;
exports.updateInstructor = updateInstructor;
exports.deleteInstructor = deleteInstructor;
exports.instructorLogin = instructorLogin;
exports.getInstructorStats = getInstructorStats;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function listInstructors(_req, res) {
    try {
        const instructors = await prisma_1.prisma.profile.findMany({
            where: { role: 'INSTRUCTOR' },
            select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                specialization: true,
                educationHistory: true,
                workExperience: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                instructedCourses: {
                    select: {
                        id: true,
                        title: true,
                        isActive: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(instructors);
    }
    catch (error) {
        console.error("Error listing instructors:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getInstructor(req, res) {
    try {
        const instructor = await prisma_1.prisma.profile.findFirst({
            where: {
                id: req.params['id'] || '',
                role: 'INSTRUCTOR'
            },
            include: {
                instructedCourses: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        isActive: true,
                        studentsCount: true,
                        rating: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        return res.json(instructor);
    }
    catch (error) {
        console.error("Error getting instructor:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function createInstructor(req, res) {
    try {
        const { username, password, email, firstName, lastName, specialization, experience, education } = req.body;
        if (!username || !password || !email || !firstName || !lastName || !specialization) {
            return res.status(400).json({
                message: "username, password, email, firstName, lastName, and specialization are required"
            });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }
        const existingProfile = await prisma_1.prisma.profile.findFirst({
            where: { email }
        });
        if (existingProfile) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    role: 'INSTRUCTOR'
                }
            });
            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    email,
                    specialization,
                    workExperience: experience ? JSON.parse(experience) : null,
                    educationHistory: education ? JSON.parse(education) : null,
                    role: 'INSTRUCTOR',
                    active: true
                }
            });
            return { user, profile };
        });
        const { password: _, ...userWithoutPassword } = result.user;
        return res.status(201).json({
            message: "Instructor created successfully",
            instructor: {
                ...result.profile,
                user: userWithoutPassword
            }
        });
    }
    catch (error) {
        console.error("Error creating instructor:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function updateInstructor(req, res) {
    try {
        const { firstName, lastName, email, specialization, experience, education, isActive } = req.body;
        const instructor = await prisma_1.prisma.profile.findFirst({
            where: {
                id: req.params['id'] || '',
                role: 'INSTRUCTOR'
            }
        });
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        if (email && email !== instructor.email) {
            const existingProfile = await prisma_1.prisma.profile.findFirst({
                where: {
                    email,
                    id: { not: req.params['id'] || '' }
                }
            });
            if (existingProfile) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }
        }
        const updatedInstructor = await prisma_1.prisma.profile.update({
            where: { id: req.params['id'] || '' },
            data: {
                firstName,
                lastName,
                email,
                specialization,
                workExperience: experience ? JSON.parse(experience) : undefined,
                educationHistory: education ? JSON.parse(education) : undefined,
                active: isActive
            }
        });
        return res.json({
            message: "Instructor updated successfully",
            instructor: updatedInstructor
        });
    }
    catch (error) {
        console.error("Error updating instructor:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function deleteInstructor(req, res) {
    try {
        const instructor = await prisma_1.prisma.profile.findFirst({
            where: {
                id: req.params['id'] || '',
                role: 'INSTRUCTOR'
            },
            include: {
                instructedCourses: true
            }
        });
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        const activeCourses = instructor.instructedCourses.filter(course => course.isActive);
        if (activeCourses.length > 0) {
            return res.status(400).json({
                message: "Cannot delete instructor with active courses. Please deactivate or reassign courses first."
            });
        }
        await prisma_1.prisma.$transaction(async (tx) => {
            await tx.profile.delete({
                where: { id: req.params['id'] || '' }
            });
            await tx.user.delete({
                where: { id: instructor.userId }
            });
        });
        return res.json({ message: "Instructor deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting instructor:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function instructorLogin(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (!user || user.role !== 'INSTRUCTOR') {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const instructor = await prisma_1.prisma.profile.findUnique({
            where: { userId: user.id }
        });
        if (!instructor || !instructor.active) {
            return res.status(401).json({
                message: "Instructor account is inactive"
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role,
            instructorId: instructor.id
        }, process.env['JWT_SECRET'] || 'your-secret-key', { expiresIn: '24h' });
        await prisma_1.prisma.profile.update({
            where: { id: instructor.id },
            data: { lastLoginAt: new Date() }
        });
        return res.json({
            message: "Login successful",
            token,
            instructor: {
                id: instructor.id,
                userId: instructor.userId,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                email: instructor.email,
                specialization: instructor.specialization,
                workExperience: instructor.workExperience,
                educationHistory: instructor.educationHistory,
                active: instructor.active
            }
        });
    }
    catch (error) {
        console.error("Error in instructor login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getInstructorStats(_req, res) {
    try {
        const totalInstructors = await prisma_1.prisma.profile.count({
            where: { role: 'INSTRUCTOR' }
        });
        const activeInstructors = await prisma_1.prisma.profile.count({
            where: {
                role: 'INSTRUCTOR',
                active: true
            }
        });
        const totalCourses = await prisma_1.prisma.course.count({
            where: {
                instructor: {
                    role: 'INSTRUCTOR'
                }
            }
        });
        const activeCourses = await prisma_1.prisma.course.count({
            where: {
                instructor: {
                    role: 'INSTRUCTOR'
                },
                isActive: true
            }
        });
        const totalStudents = await prisma_1.prisma.courseEnrollment.count({
            where: {
                course: {
                    instructor: {
                        role: 'INSTRUCTOR'
                    }
                }
            }
        });
        return res.json({
            totalInstructors,
            activeInstructors,
            totalCourses,
            activeCourses,
            totalStudents
        });
    }
    catch (error) {
        console.error("Error getting instructor stats:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=InstructorController.js.map