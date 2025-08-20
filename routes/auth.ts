import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user role management
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [JOVENES, ADOLESCENTES, EMPRESAS, GOBIERNOS_MUNICIPALES, CENTROS_DE_FORMACION, ONGS_Y_FUNDACIONES, CLIENT, AGENT, SUPERADMIN]
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     AuthToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         refreshToken:
 *           type: string
 *         role:
 *           type: string
 *         type:
 *           type: string
 *           enum: [user, municipality, company]
 *         user:
 *           type: object
 *         municipality:
 *           type: object
 *         company:
 *           type: object
 *     AuthUser:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             role:
 *               type: string
 *     RoleCheck:
 *       type: object
 *       properties:
 *         allowed:
 *           type: boolean
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 */

const JWT_SECRET = "supersecretkey"; // Use env in production
const REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7; // 7 days

const router = Router();

function generateAccessToken(user: { id: string; username: string; role: UserRole }) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken() {
  return uuidv4() + uuidv4();
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Missing or invalid data
 *       409:
 *         description: User already exists
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required." });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }
    
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role
      }
    });
    
    // Generate tokens for the new user
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: newUser.id,
        expiresAt,
      }
    });
    
    return res.status(201).json({ 
      user: { id: newUser.id, username: newUser.username, role: newUser.role },
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Unified login for users, municipalities, and companies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    
    // Try to find user in regular users table
    let user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (user && user.isActive) {
      // Verify password for regular user
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      
      // Generate tokens for regular user
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        }
      });
      
      return res.json({ 
        token: accessToken, 
        refreshToken, 
        role: user.role,
        type: 'user',
        user: { id: user.id, username: user.username, role: user.role }
      });
    }
    
    // Try to find municipality
    const municipality = await prisma.municipality.findUnique({
      where: { username }
    });
    
    if (municipality && municipality.isActive) {
      // Verify password for municipality
      const isValidPassword = await bcrypt.compare(password, municipality.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      
      // Generate JWT token for municipality
      const token = jwt.sign(
        { 
          id: municipality.id, 
          username: municipality.username, 
          name: municipality.name,
          department: municipality.department,
          type: 'municipality'
        }, 
        JWT_SECRET, 
        { expiresIn: "24h" }
      );
      
      const { password: _, ...municipalityWithoutPassword } = municipality;
      
      return res.json({
        token,
        type: 'municipality',
        municipality: municipalityWithoutPassword,
        message: "Municipality login successful"
      });
    }
    
    // Try to find company
    const company = await prisma.company.findUnique({
      where: { username }
    });
    
    if (company && company.isActive) {
      // Verify password for company
      const isValidPassword = await bcrypt.compare(password, company.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      
      // Generate JWT token for company
      const token = jwt.sign(
        { 
          id: company.id, 
          username: company.username, 
          name: company.name,
          businessSector: company.businessSector,
          type: 'company'
        }, 
        JWT_SECRET, 
        { expiresIn: "24h" }
      );
      
      const { password: _, ...companyWithoutPassword } = company;
      
      return res.json({
        token,
        type: 'company',
        company: companyWithoutPassword,
        message: "Company login successful"
      });
    }
    
    // If no entity found with this username
    return res.status(401).json({ message: "Invalid credentials." });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: New access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required." });
    }
    const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired refresh token." });
    }
    const user = await prisma.user.findUnique({ where: { id: dbToken.userId } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive." });
    }
    // Optionally: revoke old token and issue a new one
    await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt } });
    const accessToken = generateAccessToken(user);
    return res.json({ token: accessToken, refreshToken: newRefreshToken, role: user.role });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoke a refresh token (logout)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token revoked
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    // If refreshToken is provided, revoke it
    if (refreshToken) {
      const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (dbToken && !dbToken.revoked) {
        await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
      }
    }
    
    // Always return success for logout
    return res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Middleware to check JWT and extract user
async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No Bearer token." });
    }
    
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: UserRole };
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });
    
    if (!user || !user.isActive || user.role !== payload.role) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    
    (req as any).user = { id: user.id, username: user.username, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *       401:
 *         description: Invalid or missing token
 */
router.get("/me", authMiddleware, (req: Request, res: Response) => {
  return res.json({ user: (req as any).user });
});

/**
 * @swagger
 * /auth/check-role/{role}:
 *   get:
 *     summary: Check if current user has a specific role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [JOVENES, ADOLESCENTES, EMPRESAS, GOBIERNOS_MUNICIPALES, CENTROS_DE_FORMACION, ONGS_Y_FUNDACIONES, CLIENT, AGENT, SUPERADMIN]
 *         description: Role to check
 *     responses:
 *       200:
 *         description: Role check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleCheck'
 *       401:
 *         description: Invalid or missing token
 */
router.get("/check-role/:role", authMiddleware, (req: Request, res: Response) => {
  const { role } = req.params;
  const user = (req as any).user;
  if (user && user.role === role) {
    return res.json({ allowed: true });
  } else {
    return res.json({ allowed: false });
  }
});

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 */
router.get("/users", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role !== UserRole.SUPERADMIN) {
    return res.status(403).json({ message: "Super Admin access required." });
  }
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: Get a user by ID (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 *       404:
 *         description: User not found
 */
router.get("/users/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== UserRole.SUPERADMIN) {
    return res.status(403).json({ message: "Super Admin access required." });
  }
  try {
    const found = await prisma.user.findUnique({
      where: { id: req.params['id'] || '' },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!found) return res.status(404).json({ message: "User not found." });
    return res.json(found);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Create a new user (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 *       409:
 *         description: User already exists
 */
router.post("/users", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== UserRole.SUPERADMIN) {
    return res.status(403).json({ message: "Super Admin access required." });
  }
  try {
    const { username, password, role, isActive } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required." });
    }
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    return res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role, isActive: newUser.isActive });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Update a user (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [JOVENES, ADOLESCENTES, EMPRESAS, GOBIERNOS_MUNICIPALES, CENTROS_DE_FORMACION, ONGS_Y_FUNDACIONES, CLIENT, AGENT, SUPERADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 *       404:
 *         description: User not found
 */
router.put("/users/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== UserRole.SUPERADMIN) {
    return res.status(403).json({ message: "Super Admin access required." });
  }
  try {
    const { password, role, isActive } = req.body;
    const updateData: any = {};
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    const updated = await prisma.user.update({
      where: { id: req.params['id'] || '' },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return res.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @swagger
 * /auth/users/{id}:
 *   delete:
 *     summary: Delete a user (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== UserRole.SUPERADMIN) {
    return res.status(403).json({ message: "Super Admin access required." });
  }
  try {
    await prisma.user.delete({ where: { id: req.params['id'] || '' } });
    return res.json({ message: "User deleted." });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default router; 
