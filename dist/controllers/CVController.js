"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCV = getUserCV;
exports.updateUserCV = updateUserCV;
exports.getUserCoverLetter = getUserCoverLetter;
exports.saveUserCoverLetter = saveUserCoverLetter;
exports.generateCVForApplication = generateCVForApplication;
const prisma_1 = require("../lib/prisma");
async function getUserCV(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId: user.id }
        });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        const cvData = {
            personalInfo: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                addressLine: profile.addressLine,
                municipality: profile.municipality,
                cityState: profile.cityState,
                department: profile.department,
                country: profile.country,
                birthDate: profile.birthDate,
                gender: profile.gender,
                documentType: profile.documentType,
                documentNumber: profile.documentNumber,
                nationality: profile.country
            },
            jobTitle: profile.jobTitle,
            education: {
                level: profile.educationLevel,
                currentInstitution: profile.currentInstitution,
                graduationYear: profile.graduationYear,
                isStudying: profile.isStudying,
                educationHistory: profile.educationHistory || [],
                currentDegree: profile.currentDegree,
                universityName: profile.universityName,
                universityStartDate: profile.universityStartDate,
                universityEndDate: profile.universityEndDate,
                universityStatus: profile.universityStatus,
                gpa: profile.gpa,
                academicAchievements: profile.academicAchievements || []
            },
            skills: profile.skills || [],
            skillsWithLevel: profile.skillsWithLevel || [],
            interests: profile.interests || [],
            languages: profile.languages || [],
            websites: profile.websites || [],
            workExperience: profile.workExperience || [],
            extracurricularActivities: profile.extracurricularActivities || [],
            projects: profile.projects || [],
            achievements: profile.achievements || [],
            profileImage: profile.avatarUrl
        };
        return res.json(cvData);
    }
    catch (error) {
        console.error("Error getting user CV:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateUserCV(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { cvData } = req.body;
        if (!cvData) {
            return res.status(400).json({ message: "CV data is required" });
        }
        const updateData = {};
        if (cvData.personalInfo) {
            updateData.firstName = cvData.personalInfo.firstName;
            updateData.lastName = cvData.personalInfo.lastName;
            updateData.email = cvData.personalInfo.email;
            updateData.phone = cvData.personalInfo.phone;
            updateData.address = cvData.personalInfo.address;
            updateData.municipality = cvData.personalInfo.municipality;
            updateData.department = cvData.personalInfo.department;
            updateData.country = cvData.personalInfo.country;
            updateData.birthDate = cvData.personalInfo.birthDate ? new Date(cvData.personalInfo.birthDate) : null;
            updateData.gender = cvData.personalInfo.gender;
            updateData.documentType = cvData.personalInfo.documentType;
            updateData.documentNumber = cvData.personalInfo.documentNumber;
        }
        if (cvData.education) {
            updateData.educationLevel = cvData.education.level;
            updateData.currentInstitution = cvData.education.currentInstitution;
            updateData.graduationYear = cvData.education.graduationYear;
            updateData.isStudying = cvData.education.isStudying;
            if (cvData.education.educationHistory) {
                updateData.educationHistory = cvData.education.educationHistory;
            }
            if (cvData.education.currentDegree) {
                updateData.currentDegree = cvData.education.currentDegree;
            }
            if (cvData.education.universityName) {
                updateData.universityName = cvData.education.universityName;
            }
            if (cvData.education.universityStartDate) {
                updateData.universityStartDate = new Date(cvData.education.universityStartDate);
            }
            if (cvData.education.universityEndDate) {
                updateData.universityEndDate = new Date(cvData.education.universityEndDate);
            }
            if (cvData.education.universityStatus) {
                updateData.universityStatus = cvData.education.universityStatus;
            }
            if (cvData.education.gpa !== undefined) {
                updateData.gpa = cvData.education.gpa;
            }
            if (cvData.education.academicAchievements) {
                updateData.academicAchievements = cvData.education.academicAchievements;
            }
        }
        if (cvData.skills) {
            updateData.skills = cvData.skills;
        }
        if (cvData.interests) {
            updateData.interests = cvData.interests;
        }
        if (cvData.workExperience) {
            updateData.workExperience = cvData.workExperience;
        }
        if (cvData.achievements) {
            updateData.achievements = cvData.achievements;
        }
        if (cvData.profileImage) {
            updateData.avatarUrl = cvData.profileImage;
        }
        if (cvData.jobTitle) {
            updateData.jobTitle = cvData.jobTitle;
        }
        if (cvData.personalInfo?.addressLine) {
            updateData.addressLine = cvData.personalInfo.addressLine;
        }
        if (cvData.personalInfo?.cityState) {
            updateData.cityState = cvData.personalInfo.cityState;
        }
        if (cvData.languages) {
            updateData.languages = cvData.languages;
        }
        if (cvData.websites) {
            updateData.websites = cvData.websites;
        }
        if (cvData.skillsWithLevel) {
            updateData.skillsWithLevel = cvData.skillsWithLevel;
        }
        if (cvData.extracurricularActivities) {
            updateData.extracurricularActivities = cvData.extracurricularActivities;
        }
        if (cvData.projects) {
            updateData.projects = cvData.projects;
        }
        await prisma_1.prisma.profile.update({
            where: { userId: user.id },
            data: updateData
        });
        return res.json({
            message: "CV updated successfully"
        });
    }
    catch (error) {
        console.error("Error updating user CV:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getUserCoverLetter(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId: user.id }
        });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        const coverLetterData = {
            recipient: profile.coverLetterRecipient || {
                department: "Recursos Humanos",
                companyName: "Empresa",
                address: "Dirección de la empresa",
                city: "Ciudad",
                country: "País"
            },
            subject: profile.coverLetterSubject || "Postulación para posición disponible",
            content: profile.coverLetterContent || `Estimado equipo de reclutamiento,

Me dirijo a ustedes con gran interés para postularme a la posición disponible en su empresa.

Como joven profesional, estoy comprometido con mi desarrollo personal y profesional, y creo que esta oportunidad me permitiría crecer y contribuir significativamente a su organización.

Mi formación académica y mis habilidades me han preparado para enfrentar los desafíos que presenta esta posición. Soy una persona responsable, proactiva y con gran capacidad de aprendizaje.

Agradezco su consideración y quedo atento a sus comentarios.

Saludos cordiales,
${profile.firstName || '[Tu nombre]'} ${profile.lastName || ''}`,
            template: profile.coverLetterTemplate || "professional"
        };
        return res.json(coverLetterData);
    }
    catch (error) {
        console.error("Error getting user cover letter:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function saveUserCoverLetter(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { recipient, subject, content, template } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Cover letter content is required" });
        }
        if (recipient && (!recipient.department || !recipient.companyName)) {
            return res.status(400).json({ message: "Recipient department and company name are required" });
        }
        const updateData = {
            coverLetterContent: content
        };
        if (recipient) {
            updateData.coverLetterRecipient = recipient;
        }
        if (subject) {
            updateData.coverLetterSubject = subject;
        }
        if (template) {
            updateData.coverLetterTemplate = template;
        }
        await prisma_1.prisma.profile.update({
            where: { userId: user.id },
            data: updateData
        });
        return res.json({
            message: "Cover letter saved successfully",
            coverLetter: {
                recipient,
                subject,
                content,
                template
            }
        });
    }
    catch (error) {
        console.error("Error saving user cover letter:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function generateCVForApplication(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { jobOfferId, customCoverLetter } = req.body;
        if (!jobOfferId) {
            return res.status(400).json({ message: "Job offer ID is required" });
        }
        const jobOffer = await prisma_1.prisma.jobOffer.findUnique({
            where: { id: jobOfferId },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!jobOffer) {
            return res.status(404).json({ message: "Job offer not found" });
        }
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId: user.id }
        });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        const cvData = {
            personalInfo: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                municipality: profile.municipality,
                department: profile.department,
                country: profile.country,
                birthDate: profile.birthDate,
                gender: profile.gender,
                documentType: profile.documentType,
                documentNumber: profile.documentNumber
            },
            education: {
                level: profile.educationLevel,
                currentInstitution: profile.currentInstitution,
                graduationYear: profile.graduationYear,
                isStudying: profile.isStudying,
                educationHistory: profile.educationHistory || [],
                currentDegree: profile.currentDegree,
                universityName: profile.universityName,
                universityStartDate: profile.universityStartDate,
                universityEndDate: profile.universityEndDate,
                universityStatus: profile.universityStatus,
                gpa: profile.gpa,
                academicAchievements: profile.academicAchievements || []
            },
            skills: profile.skills || [],
            interests: profile.interests || [],
            workExperience: profile.workExperience || [],
            achievements: profile.achievements || [],
            profileImage: profile.avatarUrl
        };
        let coverLetter = customCoverLetter;
        if (!coverLetter) {
            if (profile.coverLetterContent) {
                coverLetter = profile.coverLetterContent;
            }
            else {
                coverLetter = `Estimado equipo de ${jobOffer.company.name},

Me dirijo a ustedes con gran interés para postularme a la posición de "${jobOffer.title}" que han publicado.

Mi formación en ${profile.educationLevel} y mis habilidades en ${profile.skills?.join(', ') || 'diversas áreas'} me han preparado para enfrentar los desafíos que presenta esta posición.

Estoy comprometido con mi desarrollo profesional y creo que esta oportunidad me permitiría crecer y contribuir significativamente a su organización.

Agradezco su consideración y quedo atento a sus comentarios.

Saludos cordiales,
${profile.firstName} ${profile.lastName}`;
            }
        }
        return res.json({
            cvData: cvData,
            coverLetter: coverLetter,
            jobOffer: {
                id: jobOffer.id,
                title: jobOffer.title,
                company: jobOffer.company.name
            }
        });
    }
    catch (error) {
        console.error("Error generating CV for application:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=CVController.js.map