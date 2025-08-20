import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { NewsStatus, NewsPriority, NewsType } from "@prisma/client";
import { getFileUrl, deleteFile } from "../middleware/upload";

/**
 * @swagger
 * /api/newsarticle:
 *   get:
 *     summary: Get all news articles (filtered by user type)
 *     tags: [News Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (PUBLISHED, DRAFT, ARCHIVED)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: authorType
 *         schema:
 *           type: string
 *         description: Filter by author type (COMPANY, GOVERNMENT, NGO)
 *     responses:
 *       200:
 *         description: List of news articles
 */
export async function listNewsArticles(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { status, category, authorType, authorId } = req.query;
    
    // Build where clause
    let whereClause: any = {};
    
    // If user is authenticated, filter based on user type
    if (user) {
      if (user.type === 'company') {
        // Companies see their own articles + published articles from others
        whereClause.OR = [
          { authorId: user.id },
          { status: 'PUBLISHED' }
        ];
      } else if (user.type === 'municipality') {
        // Municipalities see their own articles + published articles from others
        whereClause.OR = [
          { authorId: user.id },
          { status: 'PUBLISHED' }
        ];
      } else if (user.role === 'SUPERADMIN') {
        // SuperAdmin sees all articles
        // No additional filtering
      } else {
        // Other users see only published articles
        whereClause.status = 'PUBLISHED';
      }
    } else {
      // Unauthenticated users see only published articles
      whereClause.status = 'PUBLISHED';
    }
    
    // Apply filters
    if (status) {
      whereClause.status = status;
    }
    if (category) {
      whereClause.category = category;
    }
    if (authorType) {
      whereClause.authorType = authorType;
    }
    if (authorId) {
      // If specific authorId is requested, override other filters
      whereClause.authorId = authorId;
    }
    
    const articles = await prisma.newsArticle.findMany({
      where: whereClause,
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return res.json(articles);
  } catch (error: any) {
    console.error("Error listing news articles:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/newsarticle/public:
 *   get:
 *     summary: Get all published news articles (public endpoint for youth)
 *     tags: [News Articles]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (e.g., "Educación", "Empleo", "Programas Sociales")
 *       - in: query
 *         name: authorType
 *         schema:
 *           type: string
 *         description: Filter by author type (COMPANY, GOVERNMENT)
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region (e.g., "La Paz", "Cochabamba", "Santa Cruz")
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured articles only
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *         description: Filter by target audience (YOUTH, ADULTS, ALL)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of articles per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of published news articles with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       authorName:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       featured:
 *                         type: boolean
 *                       publishedAt:
 *                         type: string
 *                       viewCount:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
export async function listPublicNewsArticles(req: Request, res: Response): Promise<Response> {
  try {
    const { 
      category, 
      authorType, 
      region, 
      priority, 
      featured, 
      targetAudience,
      tags,
      limit = '20',
      page = '1'
    } = req.query;
    
    let whereClause: any = { 
      status: 'PUBLISHED',
      publishedAt: { not: null }
    };
    
    // Apply filters
    if (category) {
      whereClause.category = category;
    }
    if (authorType) {
      whereClause.authorType = authorType;
    }
    if (region) {
      whereClause.region = region;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (featured !== undefined) {
      whereClause.featured = featured === 'true';
    }
    if (targetAudience) {
      whereClause.targetAudience = {
        has: targetAudience
      };
    }
    if (tags) {
      whereClause.tags = {
        hasSome: Array.isArray(tags) ? tags : [tags]
      };
    }
    
    // Pagination
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 20;
    const skip = (pageNumber - 1) * limitNumber;
    
    // Get total count for pagination
    const totalCount = await prisma.newsArticle.count({
      where: whereClause
    });
    
    const articles = await prisma.newsArticle.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        summary: true,
        imageUrl: true,
        videoUrl: true,
        authorName: true,
        authorType: true,
        authorLogo: true,
        priority: true,
        featured: true,
        tags: true,
        category: true,
        publishedAt: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        targetAudience: true,
        region: true,
        createdAt: true
      },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' }
      ],
      skip,
      take: limitNumber
    });
    
    return res.json({
      articles,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
        hasNext: pageNumber < Math.ceil(totalCount / limitNumber),
        hasPrev: pageNumber > 1
      }
    });
  } catch (error: any) {
    console.error("Error listing public news articles:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/newsarticle/{id}:
 *   get:
 *     summary: Get news article by ID
 *     tags: [News Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article found
 *       404:
 *         description: News article not found
 */
export async function getNewsArticle(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const article = await prisma.newsArticle.findUnique({
      where: { id: id as string },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        },
        comments: {
          where: { parentId: null }, // Only top-level comments
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!article) {
      return res.status(404).json({ message: "News article not found" });
    }
    
    // Check access permissions
    if (article.status !== 'PUBLISHED' && (!user || user.id !== article.authorId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Increment view count
    await prisma.newsArticle.update({
      where: { id: id as string },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
    
    return res.json(article);
  } catch (error: any) {
    console.error("Error getting news article:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/newsarticle:
 *   post:
 *     summary: Create a new news article
 *     tags: [News Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - summary
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured:
 *                 type: boolean
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *               region:
 *                 type: string
 *               relatedLinks:
 *                 type: object
 *     responses:
 *       201:
 *         description: News article created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 */
export async function createNewsArticle(req: Request, res: Response): Promise<Response> {
  try {
    console.log('=== AUTH DEBUG ===');
    console.log('User object:', JSON.stringify((req as any).user, null, 2));
    console.log('==================');
    
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only companies, municipalities, and admins can create news articles
    if (!['company', 'municipality'].includes(user.type) && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Only companies, municipalities, and admins can create news articles" });
    }
    
    // Extract data from multer (form fields and files) or JSON
    const formData = req.body || {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    // Debug logging
    console.log('=== DEBUG: News Article Creation ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', JSON.stringify(req.files, null, 2));
    console.log('formData:', JSON.stringify(formData, null, 2));
    console.log('Content-Type:', (req as any).get('Content-Type'));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('=====================================');
    
    // Get text fields from form data or JSON body
    const title = formData.title;
    const content = formData.content;
    const summary = formData.summary;
    const category = formData.category;
    const priority = formData.priority || 'MEDIUM';
    const status = formData.status || 'DRAFT';
    
    // Process tags - convert string to array if needed
    let tags = formData.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }
    
    // Process featured - convert string to boolean if needed
    let featured = formData.featured || false;
    if (typeof featured === 'string') {
      featured = featured === 'true';
    }
    
    // Process targetAudience - convert string to array if needed
    let targetAudience = formData.targetAudience || [];
    if (typeof targetAudience === 'string') {
      targetAudience = [targetAudience];
    }
    
    const region = formData.region;
    const imageUrl = formData.imageUrl;
    const videoUrl = formData.videoUrl;
    const relatedLinks = formData.relatedLinks;

    // Handle uploaded image file
    let finalImageUrl = imageUrl;
    if (files['image'] && files['image'][0]) {
      finalImageUrl = getFileUrl(files['image'][0].filename);
    }
    
    // Validate required fields
    if (!title?.trim() || !content?.trim() || !summary?.trim() || !category?.trim()) {
      return res.status(400).json({ 
        message: "Title, content, summary, and category are required" 
      });
    }
    
    // Validate enum values
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
    
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
      });
    }
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Determine author type based on user type
    let authorType: NewsType;
    if (user.type === 'company') {
      authorType = 'COMPANY';
    } else if (user.type === 'municipality') {
      authorType = 'GOVERNMENT';
    } else {
      authorType = 'GOVERNMENT'; // Default for admins
    }
    
    // Get author information based on user type
    console.log('=== AUTHOR DEBUG ===');
    console.log('User ID:', user.id);
    console.log('User type:', user.type);
    
    let authorId = user.id; // Use the user ID directly as authorId
    let authorName = '';
    
    if (user.type === 'company') {
      // Get company name
      const company = await prisma.company.findUnique({
        where: { id: user.id },
        select: { name: true }
      });
      authorName = company?.name || 'Company';
      console.log('Company found:', company);
    } else if (user.type === 'municipality') {
      // Get municipality name
      const municipality = await prisma.municipality.findUnique({
        where: { id: user.id },
        select: { name: true }
      });
      authorName = municipality?.name || 'Municipality';
      console.log('Municipality found:', municipality);
    } else {
      authorName = 'Admin';
      console.log('Admin user');
    }
    
    console.log('Final authorId:', authorId);
    console.log('Final authorName:', authorName);
    console.log('=====================');
    
    console.log('=== ARTICLE CREATION DEBUG ===');
    console.log('authorId:', authorId);
    console.log('authorName:', authorName);
    console.log('authorType:', authorType);
    console.log('================================');
    
    const article = await prisma.newsArticle.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),
        imageUrl: finalImageUrl,
        videoUrl,
        authorId: authorId, // Use the user ID directly
        authorName,
        authorType,
        category: category.trim(),
        priority: priority as NewsPriority,
        status: status as NewsStatus,
        tags,
        featured,
        targetAudience,
        region,
        relatedLinks,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    });
    
    return res.status(201).json(article);
  } catch (error: any) {
    console.error("Error creating news article:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/newsarticle/{id}:
 *   put:
 *     summary: Update news article
 *     tags: [News Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *               featured:
 *                 type: boolean
 *               targetAudience:
 *                 type: array
 *               region:
 *                 type: string
 *               relatedLinks:
 *                 type: object
 *     responses:
 *       200:
 *         description: News article updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: News article not found
 */
export async function updateNewsArticle(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Find the article
    const article = await prisma.newsArticle.findUnique({
      where: { id: id as string }
    });
    
    if (!article) {
      return res.status(404).json({ message: "News article not found" });
    }
    
    // Check ownership or admin rights
    if (article.authorId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied. Only the author or admin can update this article" });
    }
    
    // Extract data from multer (form fields and files)
    const formData = req.body || {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    // Get text fields from form data (now directly from req.body)
    const title = formData.title;
    const content = formData.content;
    const summary = formData.summary;
    const category = formData.category;
    const priority = formData.priority;
    const status = formData.status;
    
    // Process tags - convert string to array if needed
    let tags = formData.tags;
    if (tags !== undefined && typeof tags === 'string') {
      tags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }
    
    // Process featured - convert string to boolean if needed
    let featured = formData.featured;
    if (featured !== undefined && typeof featured === 'string') {
      featured = featured === 'true';
    }
    
    // Process targetAudience - convert string to array if needed
    let targetAudience = formData.targetAudience;
    if (targetAudience !== undefined && typeof targetAudience === 'string') {
      targetAudience = [targetAudience];
    }
    
    const region = formData.region;
    const imageUrl = formData.imageUrl;
    const videoUrl = formData.videoUrl;
    const relatedLinks = formData.relatedLinks;

    // Handle uploaded image file
    let finalImageUrl = imageUrl;
    if (files['image'] && files['image'][0]) {
      finalImageUrl = getFileUrl(files['image'][0].filename);
      
      // Delete old image if it exists and is a local file
      if (article.imageUrl && article.imageUrl.startsWith('/uploads/')) {
        const oldFilename = article.imageUrl.split('/').pop();
        if (oldFilename) {
          deleteFile(oldFilename);
        }
      }
    }
    
    // Validate enum values if provided
    if (priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
          message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` 
        });
      }
    }
    
    if (status) {
      const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
    }
    
    // Build update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (category !== undefined) updateData.category = category.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (featured !== undefined) updateData.featured = featured;
    if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
    if (region !== undefined) updateData.region = region;
    if (relatedLinks !== undefined) updateData.relatedLinks = relatedLinks;
    
    // Set publishedAt if status is being changed to PUBLISHED
    if (status === 'PUBLISHED' && article.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }
    
    const updatedArticle = await prisma.newsArticle.update({
      where: { id: id as string },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
    
    return res.json(updatedArticle);
  } catch (error: any) {
    console.error("Error updating news article:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/newsarticle/{id}:
 *   delete:
 *     summary: Delete news article
 *     tags: [News Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: News article deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: News article not found
 */
export async function deleteNewsArticle(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Find the article
    const article = await prisma.newsArticle.findUnique({
      where: { id: id as string }
    });
    
    if (!article) {
      return res.status(404).json({ message: "News article not found" });
    }
    
    // Get user profile to check ownership
    let userProfile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });
    
    if (!userProfile) {
      // Create a minimal profile if it doesn't exist
      userProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: user.type === 'company' ? 'Company' : user.type === 'municipality' ? 'Municipality' : 'Admin',
          lastName: '',
          email: '',
          role: user.role || 'COMPANIES'
        }
      });
    }
    
    // Check ownership or admin rights
    if (article.authorId !== userProfile.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied. Only the author or admin can delete this article" });
    }
    
    // Delete associated image file if it exists
    if (article.imageUrl && article.imageUrl.startsWith('/uploads/')) {
      const filename = article.imageUrl.split('/').pop();
      if (filename) {
        deleteFile(filename);
      }
    }
    
    await prisma.newsArticle.delete({
      where: { id: id as string }
    });
    
    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting news article:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}
