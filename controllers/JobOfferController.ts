import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configurar multer para subida de imágenes de JobOffer
const jobOfferImageStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../uploads/job-offers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const jobOfferImageUpload = multer({
  storage: jobOfferImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para imágenes
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Permitir solo imágenes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// Middleware para subir imágenes de JobOffer
export const uploadJobOfferImages = jobOfferImageUpload.fields([
  { name: 'images', maxCount: 10 }, // Máximo 10 imágenes
  { name: 'logo', maxCount: 1 }     // 1 logo
]);

/**
 * @swagger
 * components:
 *   schemas:
 *     JobOffer:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - contractType
 *         - workModality
 *         - location
 *         - municipality
 *         - department
 *         - experienceLevel
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requirements:
 *           type: string
 *         benefits:
 *           type: string
 *           nullable: true
 *         salaryMin:
 *           type: number
 *           format: float
 *           nullable: true
 *         salaryMax:
 *           type: number
 *           format: float
 *           nullable: true
 *         salaryCurrency:
 *           type: string
 *         contractType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, INTERNSHIP, VOLUNTEER, FREELANCE]
 *         workSchedule:
 *           type: string
 *         workModality:
 *           type: string
 *           enum: [ON_SITE, REMOTE, HYBRID]
 *         location:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         longitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         logo:
 *           type: string
 *           nullable: true
 *           description: Company logo URL for this job offer
 *         municipality:
 *           type: string
 *         department:
 *           type: string
 *         experienceLevel:
 *           type: string
 *           enum: [NO_EXPERIENCE, ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL]
 *         educationRequired:
 *           type: string
 *           enum: [PRIMARY, SECONDARY, TECHNICAL, UNIVERSITY, POSTGRADUATE, OTHER]
 *           nullable: true
 *         skillsRequired:
 *           type: array
 *           items:
 *             type: string
 *         desiredSkills:
 *           type: array
 *           items:
 *             type: string
 *         applicationDeadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [ACTIVE, PAUSED, CLOSED, DRAFT]
 *         viewsCount:
 *           type: integer
 *         applicationsCount:
 *           type: integer
 *         featured:
 *           type: boolean
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         companyId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     JobOfferInput:
 *       type: object
 *       properties:
 *         (igual que JobOffer, pero todos opcionales menos los requeridos)
 */

/**
 * @swagger
 * /job-offers:
 *   get:
 *     summary: Get all job offers
 *     tags: [Job Offers]
 *     responses:
 *       200:
 *         description: List of all job offers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobOffer'
 */
export async function listJobOffers(req: Request, res: Response) {
  try {
    const { companyId, status } = req.query;
    
    // Build where clause
    let whereClause: any = {};
    
    // Filter by company if provided
    if (companyId) {
      whereClause.companyId = companyId as string;
    }
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status as string;
    }
    
    const items = await prisma.jobOffer.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            website: true,
            email: true,
            phone: true,
            address: true,
            businessSector: true,
            companySize: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(items);
  } catch (error: any) {
    console.error("Error listing job offers:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /job-offers/{id}:
 *   get:
 *     summary: Get a job offer by ID
 *     tags: [Job Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     responses:
 *       200:
 *         description: Job offer found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       404:
 *         description: Job offer not found
 */
export async function getJobOffer(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { includeApplications } = req.query;
    
    // Build include clause
    let includeClause: any = {
      company: {
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          email: true,
          phone: true,
          address: true,
          businessSector: true,
          companySize: true
        }
      }
    };
    
    // Include applications if requested and user has permission
    if (includeApplications === 'true' && user) {
      // Only companies can see applications for their own job offers
      if (user.type === 'company') {
        includeClause.applications = {
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            appliedAt: 'desc'
          }
        };
      }
      // SuperAdmin can see all applications
      else if (user.role === 'SUPERADMIN') {
        includeClause.applications = {
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            appliedAt: 'desc'
          }
        };
      }
    }
    
    const item = await prisma.jobOffer.findUnique({
      where: { id: req.params["id"] || "" },
      include: includeClause
    });
    
    if (!item) {
      return res.status(404).json({ message: "Job offer not found" });
    }
    
    // Check if company can access this job offer
    if (user && user.type === 'company' && item.companyId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(item);
  } catch (error: any) {
    console.error("Error getting job offer:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /job-offers:
 *   post:
 *     summary: Create a new job offer
 *     tags: [Job Offers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobOfferInput'
 *     responses:
 *       201:
 *         description: Job offer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       400:
 *         description: Invalid input data
 */
export async function createJobOffer(req: Request, res: Response) {
  console.log('🚀 === INICIO DE CREACIÓN DE JOB OFFER ===');
  console.log('📋 Headers recibidos:', req.headers['content-type']);
  console.log('📦 Datos del body recibidos:', JSON.stringify(req.body, null, 2));
  console.log('📁 Archivos recibidos:', req.files ? 'SÍ' : 'NO');
  
  // Extraer datos del FormData
  const { 
    title, 
    description, 
    requirements, 
    salaryMin, 
    salaryMax, 
    location, 
    latitude,
    longitude,
    contractType,
    workSchedule,
    workModality,
    experienceLevel,
    companyId,
    municipality,
    department,
    educationRequired,
    skillsRequired,
    desiredSkills,
    applicationDeadline,
    benefits
  } = req.body;
  
  if (!title || !description || !requirements || !location || !contractType || !workSchedule || !workModality || !experienceLevel || !companyId || !municipality) {
    return res.status(400).json({ 
      message: "title, description, requirements, location, contractType, workSchedule, workModality, experienceLevel, companyId, and municipality are required" 
    });
  }

  // Verify company exists and is active
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  if (!company || !company.isActive) {
    return res.status(400).json({ message: "Invalid or inactive company" });
  }

  // Procesar imágenes subidas
  let imageUrls: string[] = [];
  let logoUrl: string | null = null;

  console.log('📸 === LOGS DE PROCESAMIENTO DE IMÁGENES ===');
  console.log('🔍 Verificando si hay archivos en req.files:', !!req.files);
  
  if (req.files) {
    console.log('📁 Archivos recibidos en req.files:', Object.keys(req.files));
    console.log('📋 Contenido completo de req.files:', JSON.stringify(req.files, null, 2));
  }

  // Procesar imágenes múltiples
  if (req.files && (req.files as any).images) {
    const imageFiles = (req.files as any).images;
    console.log('🖼️  Imágenes encontradas:', imageFiles.length);
    console.log('📝 Detalles de las imágenes:');
    imageFiles.forEach((file: any, index: number) => {
      console.log(`   Imagen ${index + 1}:`);
      console.log(`     - Nombre original: ${file.originalname}`);
      console.log(`     - Nombre guardado: ${file.filename}`);
      console.log(`     - Tamaño: ${file.size} bytes`);
      console.log(`     - Tipo MIME: ${file.mimetype}`);
      console.log(`     - Ruta temporal: ${file.path}`);
    });
    imageUrls = imageFiles.map((file: any) => `/uploads/job-offers/${file.filename}`);
    console.log('🔗 URLs de imágenes generadas:', imageUrls);
  } else {
    console.log('❌ No se encontraron imágenes en req.files.images');
  }

  // Procesar logo
  if (req.files && (req.files as any).logo) {
    const logoFile = (req.files as any).logo[0];
    console.log('🏢 Logo encontrado:');
    console.log(`   - Nombre original: ${logoFile.originalname}`);
    console.log(`   - Nombre guardado: ${logoFile.filename}`);
    console.log(`   - Tamaño: ${logoFile.size} bytes`);
    console.log(`   - Tipo MIME: ${logoFile.mimetype}`);
    console.log(`   - Ruta temporal: ${logoFile.path}`);
    logoUrl = `/uploads/job-offers/${logoFile.filename}`;
    console.log('🔗 URL del logo generada:', logoUrl);
  } else {
    console.log('❌ No se encontró logo en req.files.logo');
  }

  console.log('📊 Resumen final:');
  console.log(`   - Número de imágenes: ${imageUrls.length}`);
  console.log(`   - URLs de imágenes: ${JSON.stringify(imageUrls)}`);
  console.log(`   - URL del logo: ${logoUrl}`);
  console.log('📸 === FIN DE LOGS DE IMÁGENES ===');

  // Procesar arrays de strings (skillsRequired, desiredSkills)
  const skillsRequiredArray = skillsRequired ? (typeof skillsRequired === 'string' ? JSON.parse(skillsRequired) : skillsRequired) : [];
  const desiredSkillsArray = desiredSkills ? (typeof desiredSkills === 'string' ? JSON.parse(desiredSkills) : desiredSkills) : [];

  const newItem = await prisma.jobOffer.create({
    data: {
      title,
      description,
      requirements,
      salaryMin: salaryMin ? parseFloat(salaryMin) : null,
      salaryMax: salaryMax ? parseFloat(salaryMax) : null,
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      images: imageUrls,
      logo: logoUrl,
      contractType,
      workSchedule,
      workModality,
      experienceLevel,
      companyId,
      municipality,
      department: department || "Cochabamba",
      educationRequired: educationRequired || null,
      skillsRequired: skillsRequiredArray,
      desiredSkills: desiredSkillsArray,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      benefits: benefits || null,
      isActive: true
    } as any
  });

  console.log('✅ === JOB OFFER CREADO EXITOSAMENTE ===');
  console.log('🆔 ID del JobOffer creado:', newItem.id);
  console.log('📸 Imágenes guardadas:', (newItem as any).images);
  console.log('🏢 Logo guardado:', (newItem as any).logo);
  console.log('📊 Datos completos del JobOffer creado:', JSON.stringify(newItem, null, 2));
  console.log('🚀 === FIN DE CREACIÓN DE JOB OFFER ===');

  return res.status(201).json(newItem);
}

/**
 * @swagger
 * /job-offers/{id}:
 *   put:
 *     summary: Update a job offer
 *     tags: [Job Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobOfferInput'
 *     responses:
 *       200:
 *         description: Job offer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobOffer'
 *       404:
 *         description: Job offer not found
 */
export async function updateJobOffer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing job offer ID" });
    }

    // Verificar que el JobOffer existe
    const existingJobOffer = await prisma.jobOffer.findUnique({
      where: { id }
    });

    if (!existingJobOffer) {
      return res.status(404).json({ message: "Job offer not found" });
    }

    // Extraer datos del FormData
    const { 
      title, 
      description, 
      requirements, 
      salaryMin, 
      salaryMax, 
      location, 
      latitude,
      longitude,
      contractType,
      workSchedule,
      workModality,
      experienceLevel,
      municipality,
      department,
      educationRequired,
      skillsRequired,
      desiredSkills,
      applicationDeadline,
      benefits,
      isActive,
      status
    } = req.body;

    // Procesar imágenes subidas
    let imageUrls = (existingJobOffer as any).images || [];
    let logoUrl = (existingJobOffer as any).logo;

    // Procesar nuevas imágenes múltiples
    if (req.files && (req.files as any).images) {
      const imageFiles = (req.files as any).images;
      const newImageUrls = imageFiles.map((file: any) => `/uploads/job-offers/${file.filename}`);
      
      // Si se envían nuevas imágenes, reemplazar las existentes
      // Si quieres agregar a las existentes, usa: imageUrls = [...imageUrls, ...newImageUrls];
      imageUrls = newImageUrls;
    }

    // Procesar nuevo logo
    if (req.files && (req.files as any).logo) {
      const logoFile = (req.files as any).logo[0];
      logoUrl = `/uploads/job-offers/${logoFile.filename}`;
    }

    // Procesar arrays de strings (skillsRequired, desiredSkills)
    const skillsRequiredArray = skillsRequired ? (typeof skillsRequired === 'string' ? JSON.parse(skillsRequired) : skillsRequired) : (existingJobOffer as any).skillsRequired;
    const desiredSkillsArray = desiredSkills ? (typeof desiredSkills === 'string' ? JSON.parse(desiredSkills) : desiredSkills) : (existingJobOffer as any).desiredSkills;

    // Construir objeto de datos para actualizar
    const updateData: any = {};

    // Solo actualizar campos que se proporcionen
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin ? parseFloat(salaryMin) : null;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax ? parseFloat(salaryMax) : null;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (contractType !== undefined) updateData.contractType = contractType;
    if (workSchedule !== undefined) updateData.workSchedule = workSchedule;
    if (workModality !== undefined) updateData.workModality = workModality;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (municipality !== undefined) updateData.municipality = municipality;
    if (department !== undefined) updateData.department = department;
    if (educationRequired !== undefined) updateData.educationRequired = educationRequired;
    if (applicationDeadline !== undefined) updateData.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (status !== undefined) updateData.status = status;

    // Siempre actualizar arrays e imágenes si se procesaron
    updateData.skillsRequired = skillsRequiredArray;
    updateData.desiredSkills = desiredSkillsArray;
    updateData.images = imageUrls;
    updateData.logo = logoUrl;

    const updated = await prisma.jobOffer.update({
      where: { id },
      data: updateData
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating job offer:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /job-offers/{id}:
 *   delete:
 *     summary: Delete a job offer
 *     tags: [Job Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job offer ID
 *     responses:
 *       204:
 *         description: Job offer deleted successfully
 *       404:
 *         description: Job offer not found
 */
export async function deleteJobOffer(req: Request, res: Response) {
  await prisma.jobOffer.delete({
    where: { id: req.params["id"] || "" }
  });
  res.status(204).end();
}
