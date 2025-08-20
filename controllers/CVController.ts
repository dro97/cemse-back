import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

// Obtener CV del usuario
export async function getUserCV(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Buscar el perfil del usuario
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    }) as any;

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Construir estructura de CV
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
        level: (profile as any).educationLevel,
        currentInstitution: profile.currentInstitution,
        graduationYear: profile.graduationYear,
        isStudying: profile.isStudying,
        // Educación detallada
        educationHistory: (profile as any).educationHistory || [],
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
  } catch (error: any) {
    console.error("Error getting user CV:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Actualizar CV del usuario
export async function updateUserCV(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { cvData } = req.body;

    if (!cvData) {
      return res.status(400).json({ message: "CV data is required" });
    }

    // Actualizar perfil con los datos del CV
    const updateData: any = {};

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

    if ((cvData as any).education) {
      (updateData as any).educationLevel = (cvData as any).education.level;
      updateData.currentInstitution = (cvData as any).education.currentInstitution;
      updateData.graduationYear = (cvData as any).education.graduationYear;
      updateData.isStudying = (cvData as any).education.isStudying;
      
      // Educación detallada
      if ((cvData as any).education.educationHistory) {
        (updateData as any).educationHistory = (cvData as any).education.educationHistory;
      }
      if ((cvData as any).education.currentDegree) {
        updateData.currentDegree = (cvData as any).education.currentDegree;
      }
      if ((cvData as any).education.universityName) {
        updateData.universityName = (cvData as any).education.universityName;
      }
      if ((cvData as any).education.universityStartDate) {
        updateData.universityStartDate = new Date((cvData as any).education.universityStartDate);
      }
      if ((cvData as any).education.universityEndDate) {
        updateData.universityEndDate = new Date((cvData as any).education.universityEndDate);
      }
      if ((cvData as any).education.universityStatus) {
        updateData.universityStatus = (cvData as any).education.universityStatus;
      }
      if ((cvData as any).education.gpa !== undefined) {
        updateData.gpa = (cvData as any).education.gpa;
      }
      if ((cvData as any).education.academicAchievements) {
        updateData.academicAchievements = (cvData as any).education.academicAchievements;
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

    // CV Builder fields
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

    // Actualizar perfil
    await prisma.profile.update({
      where: { userId: user.id },
      data: updateData
    });

    return res.json({
      message: "CV updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating user CV:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Obtener carta de presentación del usuario
export async function getUserCoverLetter(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Buscar el perfil del usuario
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    }) as any;

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Estructura de carta de presentación con campos editables
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
  } catch (error: any) {
    console.error("Error getting user cover letter:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Guardar carta de presentación del usuario
export async function saveUserCoverLetter(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { recipient, subject, content, template } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Cover letter content is required" });
    }

    // Validar estructura del destinatario
    if (recipient && (!recipient.department || !recipient.companyName)) {
      return res.status(400).json({ message: "Recipient department and company name are required" });
    }

    // Actualizar el perfil con los datos de la carta de presentación
    const updateData: any = {
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

    await prisma.profile.update({
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
  } catch (error: any) {
    console.error("Error saving user cover letter:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Generar CV completo para postulación
export async function generateCVForApplication(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { jobOfferId, customCoverLetter } = req.body;

    if (!jobOfferId) {
      return res.status(400).json({ message: "Job offer ID is required" });
    }

    // Verificar que la oferta existe
    const jobOffer = await prisma.jobOffer.findUnique({
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

    // Obtener perfil del usuario
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Construir CV completo
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
        level: (profile as any).educationLevel,
        currentInstitution: profile.currentInstitution,
        graduationYear: profile.graduationYear,
        isStudying: profile.isStudying,
        // Educación detallada
        educationHistory: (profile as any).educationHistory || [],
        currentDegree: (profile as any).currentDegree,
        universityName: (profile as any).universityName,
        universityStartDate: (profile as any).universityStartDate,
        universityEndDate: (profile as any).universityEndDate,
        universityStatus: (profile as any).universityStatus,
        gpa: (profile as any).gpa,
        academicAchievements: (profile as any).academicAchievements || []
      },
      skills: profile.skills || [],
      interests: profile.interests || [],
      workExperience: profile.workExperience || [],
      achievements: profile.achievements || [],
      profileImage: profile.avatarUrl
    };

    // Obtener carta de presentación guardada o generar una por defecto
    let coverLetter = customCoverLetter;
    
    if (!coverLetter) {
      if ((profile as any).coverLetterContent) {
        // Usar carta de presentación guardada
        coverLetter = (profile as any).coverLetterContent;
      } else {
        // Generar carta de presentación por defecto
        coverLetter = `Estimado equipo de ${jobOffer.company.name},

Me dirijo a ustedes con gran interés para postularme a la posición de "${jobOffer.title}" que han publicado.

Mi formación en ${(profile as any).educationLevel} y mis habilidades en ${profile.skills?.join(', ') || 'diversas áreas'} me han preparado para enfrentar los desafíos que presenta esta posición.

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
  } catch (error: any) {
    console.error("Error generating CV for application:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
