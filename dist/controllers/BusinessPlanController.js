"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestBusinessPlan = getLatestBusinessPlan;
exports.listAllBusinessPlans = listAllBusinessPlans;
exports.getBusinessPlan = getBusinessPlan;
exports.createBusinessPlan = createBusinessPlan;
exports.updateBusinessPlan = updateBusinessPlan;
exports.deleteBusinessPlan = deleteBusinessPlan;
exports.getBusinessPlanByEntrepreneurship = getBusinessPlanByEntrepreneurship;
exports.saveBusinessPlanSimulator = saveBusinessPlanSimulator;
const prisma_1 = require("../lib/prisma");
async function getLatestBusinessPlan(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const latestPlan = await prisma_1.prisma.businessPlan.findFirst({
            where: {
                entrepreneurship: {
                    ownerId: user.id
                }
            },
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return res.json(latestPlan);
    }
    catch (error) {
        console.error("Error getting latest business plan:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function listAllBusinessPlans(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const items = await prisma_1.prisma.businessPlan.findMany({
            where: {
                entrepreneurship: {
                    ownerId: user.id
                }
            },
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Error listing all business plans:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function getBusinessPlan(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const item = await prisma_1.prisma.businessPlan.findUnique({
            where: { id: id },
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true,
                        ownerId: true
                    }
                }
            }
        });
        if (!item) {
            return res.status(404).json({ message: "Business plan not found" });
        }
        if (item.entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. You can only view your own business plans" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error getting business plan:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function createBusinessPlan(req, res) {
    try {
        const user = req.user;
        const { entrepreneurshipId } = req.body;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!entrepreneurshipId) {
            return res.status(400).json({ message: "entrepreneurshipId is required" });
        }
        const entrepreneurship = await prisma_1.prisma.entrepreneurship.findUnique({
            where: { id: entrepreneurshipId },
            select: { id: true, ownerId: true, name: true }
        });
        if (!entrepreneurship) {
            return res.status(404).json({ message: "Entrepreneurship not found" });
        }
        if (entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. You can only create business plans for your own entrepreneurship" });
        }
        const existingPlan = await prisma_1.prisma.businessPlan.findUnique({
            where: { entrepreneurshipId }
        });
        if (existingPlan) {
            return res.status(400).json({ message: "Business plan already exists for this entrepreneurship" });
        }
        const newItem = await prisma_1.prisma.businessPlan.create({
            data: {
                ...req.body,
                entrepreneurshipId
            },
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true
                    }
                }
            }
        });
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error("Error creating business plan:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function updateBusinessPlan(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const existingPlan = await prisma_1.prisma.businessPlan.findUnique({
            where: { id: id },
            include: {
                entrepreneurship: {
                    select: { ownerId: true }
                }
            }
        });
        if (!existingPlan) {
            return res.status(404).json({ message: "Business plan not found" });
        }
        if (existingPlan.entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. You can only update your own business plans" });
        }
        const updated = await prisma_1.prisma.businessPlan.update({
            where: { id: id },
            data: req.body,
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true
                    }
                }
            }
        });
        return res.json(updated);
    }
    catch (error) {
        console.error("Error updating business plan:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function deleteBusinessPlan(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const existingPlan = await prisma_1.prisma.businessPlan.findUnique({
            where: { id: id },
            include: {
                entrepreneurship: {
                    select: { ownerId: true }
                }
            }
        });
        if (!existingPlan) {
            return res.status(404).json({ message: "Business plan not found" });
        }
        if (existingPlan.entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. You can only delete your own business plans" });
        }
        await prisma_1.prisma.businessPlan.delete({
            where: { id: id }
        });
        return res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting business plan:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function getBusinessPlanByEntrepreneurship(req, res) {
    try {
        const user = req.user;
        const { entrepreneurshipId } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const entrepreneurship = await prisma_1.prisma.entrepreneurship.findUnique({
            where: { id: entrepreneurshipId },
            select: { id: true, ownerId: true, name: true }
        });
        if (!entrepreneurship) {
            return res.status(404).json({ message: "Entrepreneurship not found" });
        }
        if (entrepreneurship.ownerId !== user.id) {
            return res.status(403).json({ message: "Access denied. You can only view business plans for your own entrepreneurship" });
        }
        const businessPlan = await prisma_1.prisma.businessPlan.findFirst({
            where: { entrepreneurshipId: entrepreneurshipId },
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true
                    }
                }
            }
        });
        if (!businessPlan) {
            return res.status(404).json({ message: "Business plan not found for this entrepreneurship" });
        }
        return res.json(businessPlan);
    }
    catch (error) {
        console.error("Error getting business plan by entrepreneurship:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
async function saveBusinessPlanSimulator(req, res) {
    try {
        console.log('=== BusinessPlanSimulator Debug ===');
        console.log('Headers:', req.headers);
        console.log('User from request:', req.user);
        const user = req.user;
        if (!user) {
            console.log('❌ No user found in request');
            return res.status(401).json({ message: "Authentication required" });
        }
        console.log('✅ User authenticated:', user);
        console.log('User role:', user.role);
        console.log('User type:', user.type);
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        const { entrepreneurshipId, entrepreneurshipData, tripleImpactAssessment, executiveSummary, businessDescription, marketAnalysis, competitiveAnalysis, marketingPlan, operationalPlan, managementTeam, financialProjections, riskAnalysis, businessModelCanvas, financialCalculator, currentStep, completionPercentage, isCompleted, isPublic, } = req.body;
        const mappedExecutiveSummary = executiveSummary || businessDescription || "";
        const mappedMarketingStrategy = marketingPlan || "";
        const mappedRevenueProjection = financialProjections || null;
        console.log('🔍 Validating tripleImpactAssessment:', !!tripleImpactAssessment);
        console.log('🔍 Validating executiveSummary:', !!executiveSummary);
        console.log('🔍 Validating isCompleted:', isCompleted);
        if (!tripleImpactAssessment) {
            console.log('❌ Validation failed: tripleImpactAssessment missing');
            return res.status(400).json({
                error: "Campos requeridos faltantes: tripleImpactAssessment es obligatorio"
            });
        }
        if (isCompleted && !executiveSummary) {
            console.log('❌ Validation failed: executiveSummary required for completion');
            return res.status(400).json({
                error: "Campos requeridos faltantes: executiveSummary es obligatorio para completar el plan"
            });
        }
        console.log('✅ Validation passed');
        let finalEntrepreneurshipId = entrepreneurshipId;
        console.log('🏢 Entrepreneurship handling:');
        console.log('  - entrepreneurshipData:', !!entrepreneurshipData);
        console.log('  - entrepreneurshipId:', entrepreneurshipId);
        if (entrepreneurshipData && !entrepreneurshipId) {
            console.log('📝 Creating new entrepreneurship...');
            const newEntrepreneurship = await prisma_1.prisma.entrepreneurship.create({
                data: {
                    ownerId: user.id,
                    name: entrepreneurshipData.name,
                    description: entrepreneurshipData.description,
                    category: entrepreneurshipData.category,
                    subcategory: entrepreneurshipData.subcategory,
                    businessStage: entrepreneurshipData.businessStage,
                    municipality: entrepreneurshipData.municipality,
                    department: entrepreneurshipData.department || "Cochabamba",
                    isPublic: isPublic || false
                }
            });
            finalEntrepreneurshipId = newEntrepreneurship.id;
            console.log('✅ New entrepreneurship created:', finalEntrepreneurshipId);
        }
        else if (entrepreneurshipId) {
            const existingEntrepreneurship = await prisma_1.prisma.entrepreneurship.findUnique({
                where: { id: entrepreneurshipId },
                select: { id: true, ownerId: true }
            });
            if (!existingEntrepreneurship) {
                return res.status(404).json({ message: "Entrepreneurship not found" });
            }
            if (existingEntrepreneurship.ownerId !== user.id) {
                return res.status(403).json({ message: "Access denied. You can only modify your own entrepreneurship" });
            }
            if (entrepreneurshipData) {
                await prisma_1.prisma.entrepreneurship.update({
                    where: { id: entrepreneurshipId },
                    data: {
                        name: entrepreneurshipData.name,
                        description: entrepreneurshipData.description,
                        category: entrepreneurshipData.category,
                        subcategory: entrepreneurshipData.subcategory,
                        businessStage: entrepreneurshipData.businessStage,
                        municipality: entrepreneurshipData.municipality,
                        department: entrepreneurshipData.department,
                        isPublic: isPublic || false
                    }
                });
            }
        }
        else {
            const existingEntrepreneurship = await prisma_1.prisma.entrepreneurship.findFirst({
                where: { ownerId: user.id }
            });
            if (existingEntrepreneurship) {
                console.log('🔄 Using existing entrepreneurship:', existingEntrepreneurship.name);
                finalEntrepreneurshipId = existingEntrepreneurship.id;
            }
            else {
                console.log('📝 No entrepreneurship data provided, creating default entrepreneurship...');
                const defaultEntrepreneurship = await prisma_1.prisma.entrepreneurship.create({
                    data: {
                        ownerId: user.id,
                        name: "Mi Emprendimiento",
                        description: "Emprendimiento creado desde el simulador",
                        category: "General",
                        businessStage: "IDEA",
                        municipality: "Cochabamba",
                        department: "Cochabamba",
                        isPublic: false
                    }
                });
                finalEntrepreneurshipId = defaultEntrepreneurship.id;
                console.log('✅ Default entrepreneurship created:', finalEntrepreneurshipId);
            }
        }
        const calculatedCompletion = completionPercentage || calculateCompletionPercentage({
            tripleImpactAssessment,
            executiveSummary,
            businessDescription,
            marketAnalysis,
            competitiveAnalysis,
            marketingPlan,
            operationalPlan,
            managementTeam,
            financialProjections,
            riskAnalysis,
            businessModelCanvas,
            financialCalculator
        });
        const impactAnalysis = analyzeTripleImpact(tripleImpactAssessment);
        const existingPlan = await prisma_1.prisma.businessPlan.findFirst({
            where: {
                entrepreneurship: {
                    ownerId: user.id
                }
            },
            include: {
                entrepreneurship: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        businessStage: true
                    }
                }
            }
        });
        let businessPlan;
        if (existingPlan) {
            console.log('🔄 Updating existing business plan:', existingPlan.id);
            console.log('📊 Current entrepreneurship:', existingPlan.entrepreneurship.name);
            finalEntrepreneurshipId = existingPlan.entrepreneurshipId;
            const updateData = {
                executiveSummary: mappedExecutiveSummary,
                missionStatement: businessDescription || '',
                marketAnalysis: marketAnalysis || '',
                competitiveAnalysis: competitiveAnalysis || '',
                marketingStrategy: mappedMarketingStrategy,
                operationalPlan: operationalPlan || '',
                riskAnalysis: riskAnalysis || '',
                revenueStreams: mappedRevenueProjection?.revenueStreams || [],
                initialInvestment: mappedRevenueProjection?.startupCosts || 0,
                monthlyExpenses: mappedRevenueProjection?.monthlyExpenses || 0,
                breakEvenPoint: mappedRevenueProjection?.breakEvenMonth || 0,
                tripleImpactAssessment: tripleImpactAssessment,
                isCompleted: isCompleted || false,
                lastSection: getLastSection(currentStep),
                completionPercentage: calculatedCompletion
            };
            if (managementTeam) {
                updateData.managementTeam = { team: managementTeam };
            }
            if (businessModelCanvas) {
                updateData.businessModelCanvas = businessModelCanvas;
            }
            if (financialProjections) {
                updateData.costStructure = {
                    startupCosts: financialProjections.startupCosts || 0,
                    monthlyExpenses: financialProjections.monthlyExpenses || 0,
                    breakEvenMonth: financialProjections.breakEvenMonth || 0
                };
            }
            if (financialCalculator) {
                updateData.revenueProjection = {
                    monthlyRevenue: financialCalculator.monthlyRevenue || 0,
                    cashFlowProjection: financialCalculator.cashFlowProjection || []
                };
            }
            businessPlan = await prisma_1.prisma.businessPlan.update({
                where: { entrepreneurshipId: finalEntrepreneurshipId },
                data: updateData,
                include: {
                    entrepreneurship: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            businessStage: true
                        }
                    }
                }
            });
        }
        else {
            const createData = {
                entrepreneurshipId: finalEntrepreneurshipId,
                executiveSummary: mappedExecutiveSummary,
                missionStatement: businessDescription || '',
                marketAnalysis: marketAnalysis || '',
                competitiveAnalysis: competitiveAnalysis || '',
                marketingStrategy: mappedMarketingStrategy,
                operationalPlan: operationalPlan || '',
                riskAnalysis: riskAnalysis || '',
                revenueStreams: mappedRevenueProjection?.revenueStreams || [],
                initialInvestment: mappedRevenueProjection?.startupCosts || 0,
                monthlyExpenses: mappedRevenueProjection?.monthlyExpenses || 0,
                breakEvenPoint: mappedRevenueProjection?.breakEvenMonth || 0,
                tripleImpactAssessment: tripleImpactAssessment,
                isCompleted: isCompleted || false,
                lastSection: getLastSection(currentStep),
                completionPercentage: calculatedCompletion
            };
            if (managementTeam) {
                createData.managementTeam = { team: managementTeam };
            }
            if (businessModelCanvas) {
                createData.businessModelCanvas = businessModelCanvas;
            }
            if (financialProjections) {
                createData.costStructure = {
                    startupCosts: financialProjections.startupCosts || 0,
                    monthlyExpenses: financialProjections.monthlyExpenses || 0,
                    breakEvenMonth: financialProjections.breakEvenMonth || 0
                };
            }
            if (financialCalculator) {
                createData.revenueProjection = {
                    monthlyRevenue: financialCalculator.monthlyRevenue || 0,
                    cashFlowProjection: financialCalculator.cashFlowProjection || []
                };
            }
            businessPlan = await prisma_1.prisma.businessPlan.create({
                data: createData,
                include: {
                    entrepreneurship: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            businessStage: true
                        }
                    }
                }
            });
        }
        const nextRecommendedStep = getNextRecommendedStep(currentStep, calculatedCompletion);
        return res.status(201).json({
            success: true,
            data: {
                businessPlanId: businessPlan.id,
                entrepreneurshipId: finalEntrepreneurshipId,
                message: "Plan de negocios guardado exitosamente",
                completionPercentage: calculatedCompletion,
                nextRecommendedStep,
                impactAnalysis
            }
        });
    }
    catch (error) {
        console.error("Error saving business plan simulator:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
function calculateCompletionPercentage(data) {
    const sections = [
        'tripleImpactAssessment',
        'executiveSummary',
        'businessDescription',
        'marketAnalysis',
        'competitiveAnalysis',
        'marketingPlan',
        'operationalPlan',
        'managementTeam',
        'financialProjections',
        'riskAnalysis',
        'businessModelCanvas',
        'financialCalculator'
    ];
    let completedSections = 0;
    sections.forEach(section => {
        if (data[section]) {
            if (typeof data[section] === 'string' && data[section].trim().length > 0) {
                completedSections++;
            }
            else if (typeof data[section] === 'object') {
                if (section === 'tripleImpactAssessment') {
                    const tia = data[section];
                    const hasContent = tia.problemSolved?.trim() ||
                        tia.beneficiaries?.trim() ||
                        tia.resourcesUsed?.trim() ||
                        tia.communityInvolvement?.trim() ||
                        tia.longTermImpact?.trim();
                    if (hasContent)
                        completedSections++;
                }
                else if (section === 'financialProjections') {
                    const fp = data[section];
                    const hasContent = fp.startupCosts > 0 ||
                        fp.monthlyRevenue > 0 ||
                        fp.monthlyExpenses > 0 ||
                        fp.revenueStreams?.length > 0;
                    if (hasContent)
                        completedSections++;
                }
                else if (section === 'businessModelCanvas') {
                    const bmc = data[section];
                    const hasContent = Object.values(bmc).some(value => typeof value === 'string' && value.trim().length > 0);
                    if (hasContent)
                        completedSections++;
                }
                else if (section === 'financialCalculator') {
                    const fc = data[section];
                    const hasContent = fc.initialInvestment > 0 ||
                        fc.monthlyRevenue > 0 ||
                        fc.cashFlowProjection?.length > 0;
                    if (hasContent)
                        completedSections++;
                }
                else {
                    const hasContent = Object.values(data[section]).some(value => typeof value === 'string' && value.trim().length > 0);
                    if (hasContent)
                        completedSections++;
                }
            }
        }
    });
    return Math.round((completedSections / sections.length) * 100);
}
function analyzeTripleImpact(tripleImpactAssessment) {
    const analysis = {
        economic: false,
        social: false,
        environmental: false,
        impactScore: 0,
        recommendations: []
    };
    const text = JSON.stringify(tripleImpactAssessment).toLowerCase();
    const economic = text.includes('trabajo') ||
        text.includes('empleo') ||
        text.includes('ingresos') ||
        text.includes('finanzas') ||
        text.includes('rentabilidad') ||
        text.includes('económico');
    const social = text.includes('comunidad') ||
        text.includes('personas') ||
        text.includes('sociedad') ||
        text.includes('familias') ||
        text.includes('beneficiarios') ||
        text.includes('social');
    const environmental = text.includes('sostenible') ||
        text.includes('medio ambiente') ||
        text.includes('verde') ||
        text.includes('recicl') ||
        text.includes('ambiental') ||
        text.includes('ecológico');
    analysis.economic = economic;
    analysis.social = social;
    analysis.environmental = environmental;
    analysis.impactScore = [economic, social, environmental].filter(Boolean).length * 33.33;
    if (!economic) {
        analysis.recommendations.push('Considera el impacto económico de tu emprendimiento');
    }
    if (!social) {
        analysis.recommendations.push('Evalúa el impacto social en la comunidad');
    }
    if (!environmental) {
        analysis.recommendations.push('Analiza el impacto ambiental de tu negocio');
    }
    return analysis;
}
function getLastSection(currentStep) {
    const sections = [
        'triple_impact_assessment',
        'executive_summary',
        'business_description',
        'market_analysis',
        'competitive_analysis',
        'marketing_plan',
        'operational_plan',
        'financial_projections',
        'risk_analysis',
        'business_model_canvas'
    ];
    return sections[currentStep] || 'executive_summary';
}
function getNextRecommendedStep(currentStep, completionPercentage) {
    const sections = [
        'tripleImpactAssessment',
        'executiveSummary',
        'businessDescription',
        'marketAnalysis',
        'competitiveAnalysis',
        'marketingPlan',
        'operationalPlan',
        'managementTeam',
        'financialProjections',
        'riskAnalysis'
    ];
    if (completionPercentage >= 100)
        return -1;
    for (let i = currentStep; i < sections.length; i++) {
        return i;
    }
    return sections.length - 1;
}
//# sourceMappingURL=BusinessPlanController.js.map