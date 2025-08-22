import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { NewsStatus, NewsPriority, NewsType } from "@prisma/client";
import { getFileUrl, deleteFile } from "../middleware/upload";

// Helper function to get the correct authorId for a user
async function getUserAuthorId(user: any): Promise<string> {
  if (user.type === 'company' || user.role === 'COMPANIES') {
    const profile = await prisma.profile.findFirst({
      where: { companyId: user.id },
      select: { userId: true }
    });
    if (profile) {
      return profile.userId;
    }
  } else if (user.type === 'municipality' || user.role === 'MUNICIPAL_GOVERNMENTS') {
    // Find the municipality created by this user
    const municipality = await prisma.municipality.findFirst({
      where: { createdBy: user.id },
      select: { id: true }
    });
    
    if (municipality) {
      const profile = await prisma.profile.findFirst({
        where: { userId: municipality.id },
        select: { userId: true }
      });
      if (profile) {
        return profile.userId;
      } else {
        // If no profile exists, use the municipality ID directly
        return municipality.id;
      }
    }
  }
  
  // Default to user ID
  return user.id;
}

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
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by specific author ID
 *       - in: query
 *         name: municipalityId
 *         schema:
 *           type: string
 *         description: Filter by municipality ID (returns articles from all companies and the municipality itself)
 *     responses:
 *       200:
 *         description: List of news articles
 */
export async function listNewsArticles(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { status, category, authorType, authorId, municipalityId } = req.query;
    
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
    
    // Handle municipality filtering
    if (municipalityId) {
      console.log('Filtering by municipalityId:', municipalityId);
      
      // Get all profiles that belong to companies in this municipality
      const municipalityCompanies = await prisma.company.findMany({
        where: { municipalityId: municipalityId as string },
        select: { id: true }
      });
      
      const companyIds = municipalityCompanies.map(company => company.id);
      console.log('Found companies in municipality:', companyIds);
      
      // Get all profiles that belong to these companies
      const municipalityProfiles = await prisma.profile.findMany({
        where: { 
          OR: [
            { companyId: { in: companyIds } },
            { userId: municipalityId as string } // Also include the municipality itself
          ]
        },
        select: { userId: true }
      });
      
      const profileUserIds = municipalityProfiles.map(profile => profile.userId);
      console.log('Found profile user IDs:', profileUserIds);
      
      // Filter articles by these author IDs
      if (profileUserIds.length > 0) {
        whereClause.authorId = { in: profileUserIds };
      } else {
        // If no profiles found, return empty result
        console.log('No profiles found for municipality, returning empty result');
        return res.json([]);
      }
    } else if (authorId) {
      // If specific authorId is requested, use it directly
      whereClause.authorId = authorId;
    }
    
    console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));
    
    const articles = await prisma.newsArticle.findMany({
      where: whereClause,
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    console.log('Found articles:', articles.length);
    
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
 *         description: Filter by category (e.g., Educación, Empleo, Programas Sociales)
 *       - in: query
 *         name: authorType
 *         schema:
 *           type: string
 *         description: Filter by author type (COMPANY, GOVERNMENT)
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region (e.g., La Paz, Cochabamba, Santa Cruz)
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
    if (article.status !== 'PUBLISHED') {
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const userAuthorId = await getUserAuthorId(user);
      
      if (userAuthorId !== article.authorId && user.role !== 'SUPERADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }
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
    const allowedTypes = ['company', 'municipality'];
    const allowedRoles = ['SUPERADMIN', 'MUNICIPAL_GOVERNMENTS'];
    
    const hasValidType = user.type && allowedTypes.includes(user.type);
    const hasValidRole = user.role && allowedRoles.includes(user.role);
    
    if (!hasValidType && !hasValidRole) {
      return res.status(403).json({ message: "Only companies, municipalities, and admins can create news articles" });
    }
    
    // Extract data from multer (form fields and files) or JSON
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    // Handle both JSON and form data
    const contentType = req.get('Content-Type');
    const isJsonRequest = contentType && contentType.includes('application/json');
    
    // Debug logging for form data processing
    console.log('=== FORM DATA DEBUG ===');
    console.log('Content-Type:', contentType);
    console.log('Is JSON request:', isJsonRequest);
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('req.body.title:', req.body.title);
    console.log('req.body.content:', req.body.content);
    console.log('req.body.summary:', req.body.summary);
    console.log('req.body.category:', req.body.category);
    console.log('req.files:', req.files);
    console.log('========================');
    
    // For JSON requests, validate that we have the required fields
    if (isJsonRequest && (!req.body || !req.body.title)) {
      return res.status(400).json({ 
        message: "Invalid JSON data. Required fields: title, content, summary, category",
        debug: {
          contentType: contentType,
          isJsonRequest: isJsonRequest,
          bodyExists: !!req.body,
          bodyKeys: req.body ? Object.keys(req.body) : []
        }
      });
    }
    
    // Debug logging
    console.log('=== DEBUG: News Article Creation ===');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', JSON.stringify(req.files, null, 2));
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', (req as any).get('Content-Type'));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('=====================================');
    
    // Get text fields from form data or JSON body
    const title = req.body.title;
    const content = req.body.content;
    const summary = req.body.summary;
    const category = req.body.category;
    const priority = req.body.priority || 'MEDIUM';
    const status = req.body.status || 'DRAFT';
    
    // Process tags - convert string to array if needed
    let tags = req.body.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }
    
    // Process featured - convert string to boolean if needed
    let featured = req.body.featured || false;
    if (typeof featured === 'string') {
      featured = featured === 'true';
    }
    
    // Process targetAudience - convert string to array if needed
    let targetAudience = req.body.targetAudience || [];
    if (typeof targetAudience === 'string') {
      targetAudience = [targetAudience];
    }
    
    const region = req.body.region;
    const imageUrl = req.body.imageUrl;
    const videoUrl = req.body.videoUrl;
    const relatedLinks = req.body.relatedLinks;

    // Handle uploaded image file
    let finalImageUrl = imageUrl;
    if (files['image'] && files['image'][0]) {
      finalImageUrl = getFileUrl(files['image'][0].filename);
    }
    
    // Validate required fields
    if (!title?.trim() || !content?.trim() || !summary?.trim() || !category?.trim()) {
      return res.status(400).json({ 
        message: "Title, content, summary, and category are required",
        received: { 
          title: title?.trim(), 
          content: content?.trim(), 
          summary: summary?.trim(), 
          category: category?.trim() 
        },
        debug: {
          contentType: contentType,
          isJsonRequest: isJsonRequest,
          bodyKeys: Object.keys(req.body || {}),
          bodyValues: {
            title: req.body.title,
            content: req.body.content,
            summary: req.body.summary,
            category: req.body.category
          }
        }
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
    
    // Determine author type based on user type or role
    let authorType: NewsType;
    if (user.type === 'company' || user.role === 'COMPANIES') {
      authorType = 'COMPANY';
    } else if (user.type === 'municipality' || user.role === 'MUNICIPAL_GOVERNMENTS') {
      authorType = 'GOVERNMENT';
    } else {
      authorType = 'GOVERNMENT'; // Default for admins
    }
    
    // Get author information based on user type
    console.log('=== AUTHOR DEBUG ===');
    console.log('User ID:', user.id);
    console.log('User type:', user.type);
    console.log('User role:', user.role);
    console.log('Request authorId:', req.body.authorId);
    console.log('Request authorName:', req.body.authorName);
    
    let authorId: string;
    let authorName: string;
    
    if (user.type === 'company' || user.role === 'COMPANIES') {
      // For companies, we need to find the profile associated with this company
      const company = await prisma.company.findUnique({
        where: { id: user.id },
        select: { id: true, name: true }
      });
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Find the profile for this company
      const profile = await prisma.profile.findFirst({
        where: { companyId: user.id },
        select: { userId: true, firstName: true, lastName: true }
      });
      
      if (!profile) {
        // Create a profile for the company if it doesn't exist
        const newProfile = await prisma.profile.create({
          data: {
            userId: user.id, // Use the company ID as userId
            firstName: company.name,
            lastName: '',
            email: user.email || '',
            role: 'COMPANIES' as any,
            companyId: user.id
          }
        });
        authorId = newProfile.userId;
        authorName = company.name;
      } else {
        authorId = profile.userId;
        authorName = company.name;
      }
      
      console.log('Company found:', company);
      console.log('Profile for company:', profile);
      
    } else if (user.type === 'municipality' || user.role === 'MUNICIPAL_GOVERNMENTS') {
      // For municipality users, use their own ID as authorId
      console.log('Processing municipality user');
      
      // Find or create profile for this user
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { userId: true, firstName: true, lastName: true }
      });
      
      if (!profile) {
        // Create a profile for the municipality user if it doesn't exist
        const newProfile = await prisma.profile.create({
          data: {
            userId: user.id,
            firstName: req.body.authorName || user.username,
            lastName: '',
            email: user.email || '',
            role: 'MUNICIPAL_GOVERNMENTS' as any
          }
        });
        authorId = newProfile.userId;
        authorName = req.body.authorName || user.username;
      } else {
        authorId = profile.userId;
        authorName = req.body.authorName || profile.firstName || user.username;
      }
      
      console.log('Municipality user profile found/created:', profile);
      
    } else {
      // For admins, use the user ID directly
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { userId: true, firstName: true, lastName: true }
      });
      
      if (!profile) {
        // Create a basic profile for admin
        const newProfile = await prisma.profile.create({
          data: {
            userId: user.id,
            firstName: 'Admin',
            lastName: '',
            email: user.email || '',
            role: 'SUPERADMIN' as any
          }
        });
        authorId = newProfile.userId;
        authorName = 'Admin';
      } else {
        authorId = profile.userId;
        authorName = profile.firstName || 'Admin';
      }
      
      console.log('Admin user');
      console.log('Profile for admin:', profile);
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
    const userAuthorId = await getUserAuthorId(user);
    
    if (article.authorId !== userAuthorId && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied. Only the author or admin can update this article" });
    }
    
    // Extract data from multer (form fields and files)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    // Get text fields from form data (now directly from req.body)
    const title = req.body.title;
    const content = req.body.content;
    const summary = req.body.summary;
    const category = req.body.category;
    const priority = req.body.priority;
    const status = req.body.status;
    
    // Process tags - convert string to array if needed
    let tags = req.body.tags;
    if (tags !== undefined && typeof tags === 'string') {
      tags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }
    
    // Process featured - convert string to boolean if needed
    let featured = req.body.featured;
    if (featured !== undefined && typeof featured === 'string') {
      featured = featured === 'true';
    }
    
    // Process targetAudience - convert string to array if needed
    let targetAudience = req.body.targetAudience;
    if (targetAudience !== undefined && typeof targetAudience === 'string') {
      targetAudience = [targetAudience];
    }
    
    const region = req.body.region;
    const imageUrl = req.body.imageUrl;
    const videoUrl = req.body.videoUrl;
    const relatedLinks = req.body.relatedLinks;

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
    
    // Check ownership or admin rights
    const userAuthorId = await getUserAuthorId(user);
    
    if (article.authorId !== userAuthorId && user.role !== 'SUPERADMIN') {
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
