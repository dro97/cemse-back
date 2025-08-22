import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - category
 *         - format
 *         - thumbnail
 *         - author
 *         - publishedDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the resource
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         category:
 *           type: string
 *         format:
 *           type: string
 *         downloadUrl:
 *           type: string
 *         externalUrl:
 *           type: string
 *         thumbnail:
 *           type: string
 *         author:
 *           type: string
 *         publishedDate:
 *           type: string
 *           format: date-time
 *         downloads:
 *           type: integer
 *         rating:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ResourceInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - category
 *         - format
 *         - thumbnail
 *         - author
 *         - publishedDate
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         category:
 *           type: string
 *         format:
 *           type: string
 *         downloadUrl:
 *           type: string
 *         externalUrl:
 *           type: string
 *         thumbnail:
 *           type: string
 *         author:
 *           type: string
 *         publishedDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources with optional filters
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter by municipality name
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: List of filtered resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export async function listResources(req: Request, res: Response) {
  try {
    const { municipality, author, category, type, tags } = req.query;
    
    // Construir filtros
    const where: any = {};
    
    if (municipality) {
      where.OR = [
        { author: { contains: municipality as string, mode: 'insensitive' } },
        { title: { contains: municipality as string, mode: 'insensitive' } },
        { description: { contains: municipality as string, mode: 'insensitive' } },
        { tags: { hasSome: [municipality as string] } }
      ];
    }
    
    if (author) {
      where.author = { contains: author as string, mode: 'insensitive' };
    }
    
    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }
    
    if (type) {
      where.type = { contains: type as string, mode: 'insensitive' };
    }
    
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }
    
    const items = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json(items);
  } catch (error) {
    console.error("Error listing resources:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 */
export async function getResource(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing id" });
  const item = await prisma.resource.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ message: "Resource not found" });
  return res.json(item);
}

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource with file upload (SuperAdmin and Organizations only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - category
 *               - format
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               format:
 *                 type: string
 *               author:
 *                 type: string
 *               externalUrl:
 *                 type: string
 *               tags:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resource created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
export async function createResource(req: Request, res: Response): Promise<Response> {
  try {
    // Check authentication
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check permissions - only SuperAdmin and organizations can create resources
    const allowedRoles = ['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'];
    const allowedTypes = ['user', 'municipality', 'company'];
    
    const hasValidRole = user.role && allowedRoles.includes(user.role);
    const hasValidType = user.type && allowedTypes.includes(user.type);
    
    if (!hasValidRole && !hasValidType) {
      return res.status(403).json({ 
        message: "Access denied. Only SuperAdmin and organizations can create resources" 
      });
    }

    // Debug: Log the request body and files
    console.log('🔍 [DEBUG] req.body:', req.body);
    console.log('📁 [DEBUG] req.files:', req.files);
    console.log('📋 [DEBUG] (req as any).uploadedResource:', (req as any).uploadedResource);

    const { 
      title, 
      description, 
      type, 
      category, 
      format, 
      author,
      externalUrl,
      tags
    } = req.body || {};

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    // Validate required fields
    if (!title || !description || !type || !category || !format || !author) {
      console.log('❌ [DEBUG] Missing required fields:', { title, description, type, category, format, author });
      return res.status(400).json({ 
        message: "title, description, type, category, format, and author are required",
        received: { title, description, type, category, format, author }
      });
    }

    let downloadUrl = '';
    let thumbnail = '';
    let filePath = '';
    let fileSize = 0;

    // Handle file upload from MinIO if provided
    if ((req as any).uploadedResource) {
      console.log('📁 [DEBUG] Procesando (req as any).uploadedResource');
      downloadUrl = (req as any).uploadedResource.url;
      filePath = (req as any).uploadedResource.filename;
      fileSize = (req as any).uploadedResource.size;
      thumbnail = downloadUrl || ''; // Use the uploaded file as thumbnail for now
      console.log('📁 [DEBUG] Resource URL desde uploadedResource:', downloadUrl);
    } else if (files['file'] && files['file'][0]) {
      // Fallback to local file if MinIO upload failed
      console.log('⚠️ [DEBUG] Fallback a archivo local');
      const file = files['file'][0];
      downloadUrl = `/uploads/resources/${file.filename}`;
      filePath = file.path;
      fileSize = file?.size;
      thumbnail = downloadUrl || '';
    } else if (externalUrl) {
      // For external links, use the URL directly
      downloadUrl = externalUrl;
      thumbnail = externalUrl || '';
    } else {
      return res.status(400).json({ 
        message: "Either a file or externalUrl must be provided" 
      });
    }

    // Parse tags if provided as string
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        // If parsing fails, treat as comma-separated string
        parsedTags = tags.split(',').map((tag: string) => tag.trim());
      }
    }

    const item = await prisma.resource.create({ 
      data: {
        title: title.trim(),
        description: description.trim(),
        type: type.trim(),
        category: category.trim(),
        format: format.trim(),
        downloadUrl,
        externalUrl: externalUrl || null,
        thumbnail,
        author: author.trim(),
        publishedDate: new Date(),
        downloads: 0,
        rating: 0,
        tags: parsedTags
      } as any
    });

    return res.status(201).json({
      ...item,
      filePath,
      fileSize
    });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Update a resource by ID with file upload (SuperAdmin and Organizations only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               format:
 *                 type: string
 *               author:
 *                 type: string
 *               externalUrl:
 *                 type: string
 *               tags:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resource updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Resource not found
 */
export async function updateResource(req: Request, res: Response): Promise<Response> {
  try {
    // Check authentication
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check permissions - only SuperAdmin and organizations can update resources
    const allowedRoles = ['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'];
    const allowedTypes = ['user', 'municipality', 'company'];
    
    const hasValidRole = user.role && allowedRoles.includes(user.role);
    const hasValidType = user.type && allowedTypes.includes(user.type);
    
    if (!hasValidRole && !hasValidType) {
      return res.status(403).json({ 
        message: "Access denied. Only SuperAdmin and organizations can update resources" 
      });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing id" });

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({ where: { id } });
    if (!existingResource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    const { 
      title, 
      description, 
      type, 
      category, 
      format, 
      author,
      externalUrl,
      tags
    } = req.body || {};

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};

    let downloadUrl = existingResource.downloadUrl;
    let thumbnail: string = existingResource.thumbnail || '';
    let filePath = '';
    let fileSize = 0;

    // Handle file upload from MinIO if provided
    if ((req as any).uploadedResource) {
      console.log('📁 [DEBUG] Procesando actualización con uploadedResource');
      downloadUrl = (req as any).uploadedResource.url;
      filePath = (req as any).uploadedResource.filename;
      fileSize = (req as any).uploadedResource.size;
      thumbnail = downloadUrl || '';
    } else if (files['file'] && files['file'][0]) {
      console.log('⚠️ [DEBUG] Fallback a archivo local para actualización');
      const file = files['file'][0];
      downloadUrl = `/uploads/resources/${file.filename}`;
      filePath = file.path;
      fileSize = file?.size;
      thumbnail = downloadUrl || '';
    } else if (externalUrl) {
      downloadUrl = externalUrl;
      thumbnail = externalUrl || '';
    }

    // Parse tags if provided
    let parsedTags: string[] = existingResource.tags;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        parsedTags = tags.split(',').map((tag: string) => tag.trim());
      }
    }

    const updateData: any = {};
    
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (type) updateData.type = type.trim();
    if (category) updateData.category = category.trim();
    if (format) updateData.format = format.trim();
    if (author) updateData.author = author.trim();
    if (downloadUrl) updateData.downloadUrl = downloadUrl;
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl || null;
    if (thumbnail) updateData.thumbnail = thumbnail;
    if (parsedTags) updateData.tags = parsedTags;

    try {
      const item = await prisma.resource.update({ 
        where: { id: id || '' }, 
        data: updateData 
      });
      return res.json({
        ...item,
        filePath,
        fileSize
      });
    } catch {
      return res.status(404).json({ message: "Resource not found" });
    }
  } catch (error: any) {
    console.error("Error updating resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID (SuperAdmin only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       204:
 *         description: Resource deleted
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Resource not found
 */
export async function deleteResource(req: Request, res: Response): Promise<Response> {
  try {
    // Check authentication
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check permissions - only SuperAdmin can delete resources
    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        message: "Access denied. Only SuperAdmin can delete resources" 
      });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing id" });
    try {
      await prisma.resource.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ message: "Resource not found" });
    }
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
} 

/**
 * @swagger
 * /resources/municipality/{municipalityId}:
 *   get:
 *     summary: Get resources for a specific municipality
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: municipalityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Municipality ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *     responses:
 *       200:
 *         description: List of municipality resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Municipality not found
 */
export async function getMunicipalityResources(req: Request, res: Response): Promise<Response> {
  try {
    const { municipalityId } = req.params;
    const { category, type } = req.query;
    
    if (!municipalityId) {
      return res.status(400).json({ message: "Missing municipality ID" });
    }

    // Primero verificar si el municipio existe
    const municipality = await prisma.municipality.findUnique({
      where: { id: municipalityId },
      select: { id: true, name: true, department: true }
    });

    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    // Construir filtros para recursos del municipio
    const where: any = {
      OR: [
        { author: { contains: municipality.name, mode: 'insensitive' } },
        { title: { contains: municipality.name, mode: 'insensitive' } },
        { description: { contains: municipality.name, mode: 'insensitive' } },
        { tags: { hasSome: [municipality.name, municipality.department] } }
      ]
    };

    // Agregar filtros adicionales si se proporcionan
    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }
    
    if (type) {
      where.type = { contains: type as string, mode: 'insensitive' };
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      municipality: {
        id: municipality.id,
        name: municipality.name,
        department: municipality.department
      },
      resources,
      totalCount: resources.length
    });
  } catch (error) {
    console.error("Error getting municipality resources:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /resources/municipality/{municipalityName}/search:
 *   get:
 *     summary: Search resources by municipality name
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: municipalityName
 *         required: true
 *         schema:
 *           type: string
 *         description: Municipality name to search for
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *     responses:
 *       200:
 *         description: List of resources for municipality
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export async function searchMunicipalityResources(req: Request, res: Response): Promise<Response> {
  try {
    const { municipalityName } = req.params;
    const { category, type } = req.query;
    
    if (!municipalityName) {
      return res.status(400).json({ message: "Missing municipality name" });
    }

    // Construir filtros para buscar recursos relacionados con el municipio
    const where: any = {
      OR: [
        { author: { contains: municipalityName, mode: 'insensitive' } },
        { title: { contains: municipalityName, mode: 'insensitive' } },
        { description: { contains: municipalityName, mode: 'insensitive' } },
        { tags: { hasSome: [municipalityName] } }
      ]
    };

    // Agregar filtros adicionales si se proporcionan
    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }
    
    if (type) {
      where.type = { contains: type as string, mode: 'insensitive' };
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      searchTerm: municipalityName,
      resources,
      totalCount: resources.length
    });
  } catch (error) {
    console.error("Error searching municipality resources:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 