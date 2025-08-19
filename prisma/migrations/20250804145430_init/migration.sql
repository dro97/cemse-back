-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('YOUTH', 'ADOLESCENTS', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'TECHNICAL', 'UNIVERSITY', 'POSTGRADUATE', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SENT', 'UNDER_REVIEW', 'PRE_SELECTED', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'VOLUNTEER', 'FREELANCE');

-- CreateEnum
CREATE TYPE "WorkModality" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('NO_EXPERIENCE', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('SOFT_SKILLS', 'BASIC_COMPETENCIES', 'JOB_PLACEMENT', 'ENTREPRENEURSHIP', 'TECHNICAL_SKILLS', 'DIGITAL_LITERACY', 'COMMUNICATION', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'TEXT', 'QUIZ', 'EXERCISE', 'DOCUMENT', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'SORT_ELEMENTS', 'MULTIPLE_SELECT', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "NewsType" AS ENUM ('COMPANY', 'GOVERNMENT', 'NGO');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NewsPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "BusinessStage" AS ENUM ('IDEA', 'STARTUP', 'GROWING', 'ESTABLISHED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'YOUTH',
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "municipality" TEXT,
    "department" TEXT DEFAULT 'Cochabamba',
    "country" TEXT DEFAULT 'Bolivia',
    "birth_date" TIMESTAMP(3),
    "gender" TEXT,
    "document_type" TEXT,
    "document_number" TEXT,
    "education_level" "EducationLevel",
    "current_institution" TEXT,
    "graduation_year" INTEGER,
    "is_studying" BOOLEAN,
    "skills" TEXT[],
    "interests" TEXT[],
    "work_experience" JSONB,
    "company_name" TEXT,
    "tax_id" TEXT,
    "legal_representative" TEXT,
    "business_sector" TEXT,
    "company_size" "CompanySize",
    "company_description" TEXT,
    "website" TEXT,
    "founded_year" INTEGER,
    "institution_name" TEXT,
    "institution_type" TEXT,
    "service_area" TEXT,
    "specialization" TEXT[],
    "institution_description" TEXT,
    "profile_completion" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "parental_consent" BOOLEAN NOT NULL DEFAULT false,
    "parent_email" TEXT,
    "consent_date" TIMESTAMP(3),
    "achievements" JSONB,
    "company_id" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT,
    "salary_min" DECIMAL(65,30),
    "salary_max" DECIMAL(65,30),
    "salary_currency" TEXT DEFAULT 'BOB',
    "contract_type" "ContractType" NOT NULL,
    "work_schedule" TEXT NOT NULL,
    "work_modality" "WorkModality" NOT NULL,
    "location" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Cochabamba',
    "experience_level" "ExperienceLevel" NOT NULL,
    "education_required" "EducationLevel",
    "skills_required" TEXT[],
    "desired_skills" TEXT[],
    "application_deadline" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_questions" (
    "id" TEXT NOT NULL,
    "job_offer_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[],
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "job_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "job_offer_id" TEXT NOT NULL,
    "cover_letter" TEXT,
    "cv_url" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SENT',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "notes" TEXT,
    "rating" INTEGER,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_question_answers" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "job_question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT,
    "thumbnail" TEXT,
    "video_preview" TEXT,
    "objectives" TEXT[],
    "prerequisites" TEXT[],
    "duration" INTEGER NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "category" "CourseCategory" NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(65,30) DEFAULT 0,
    "rating" DECIMAL(65,30) DEFAULT 0,
    "students_count" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DECIMAL(65,30) DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_quizzes" INTEGER NOT NULL DEFAULT 0,
    "total_resources" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "certification" BOOLEAN NOT NULL DEFAULT true,
    "included_materials" TEXT[],
    "instructor_id" TEXT,
    "institution_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" TEXT[],

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "content_type" "LessonType" NOT NULL,
    "video_url" TEXT,
    "duration" INTEGER,
    "order_index" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "is_preview" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "progress" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "current_module_id" TEXT,
    "current_lesson_id" TEXT,
    "certificate_url" TEXT,
    "time_spent" INTEGER NOT NULL DEFAULT 0,
    "certificate_issued" BOOLEAN NOT NULL DEFAULT false,
    "final_grade" INTEGER,
    "module_progress" JSONB,
    "quiz_results" JSONB,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "time_spent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "course_id" TEXT,
    "lesson_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "time_limit" INTEGER,
    "passing_score" INTEGER NOT NULL DEFAULT 70,
    "show_correct_answers" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" TEXT[],
    "correct_answer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT,
    "quiz_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "score" INTEGER,
    "passed" BOOLEAN,
    "time_spent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "time_spent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'default',
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verification_code" TEXT NOT NULL,
    "digital_signature" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "url" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussions" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrepreneurships" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "business_stage" "BusinessStage" NOT NULL,
    "logo" TEXT,
    "images" TEXT[],
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "municipality" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Cochabamba',
    "social_media" JSONB,
    "founded" TIMESTAMP(3),
    "employees" INTEGER,
    "annual_revenue" DECIMAL(65,30),
    "business_model" TEXT,
    "target_market" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(65,30) DEFAULT 0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrepreneurships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_plans" (
    "id" TEXT NOT NULL,
    "entrepreneurship_id" TEXT NOT NULL,
    "executive_summary" TEXT,
    "mission_statement" TEXT,
    "vision_statement" TEXT,
    "market_analysis" TEXT,
    "target_market" TEXT,
    "competitive_analysis" TEXT,
    "business_model_canvas" JSONB,
    "revenue_streams" TEXT[],
    "cost_structure" JSONB,
    "marketing_strategy" TEXT,
    "pricing_strategy" TEXT,
    "sales_strategy" TEXT,
    "initial_investment" DECIMAL(65,30),
    "monthly_expenses" DECIMAL(65,30),
    "revenue_projection" JSONB,
    "break_even_point" INTEGER,
    "roi" DECIMAL(65,30),
    "risk_analysis" TEXT,
    "mitigation_strategies" TEXT[],
    "operational_plan" TEXT,
    "management_team" JSONB,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "last_section" TEXT,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image_url" TEXT,
    "video_url" TEXT,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_type" "NewsType" NOT NULL,
    "author_logo" TEXT,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "NewsPriority" NOT NULL DEFAULT 'MEDIUM',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "category" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "target_audience" TEXT[],
    "region" TEXT,
    "related_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_comments" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_avatar" TEXT,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "download_url" TEXT,
    "external_url" TEXT,
    "thumbnail" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "published_date" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "external_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "region" TEXT,
    "population" INTEGER,
    "mayor_name" TEXT,
    "mayor_email" TEXT,
    "mayor_phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "municipality_username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "municipality_email" TEXT NOT NULL,
    "phone" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tax_id" TEXT,
    "legal_representative" TEXT,
    "business_sector" TEXT,
    "company_size" "CompanySize",
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "founded_year" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "municipality_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_role_idx" ON "profiles"("role");

-- CreateIndex
CREATE INDEX "profiles_municipality_idx" ON "profiles"("municipality");

-- CreateIndex
CREATE INDEX "profiles_status_idx" ON "profiles"("status");

-- CreateIndex
CREATE INDEX "job_offers_company_id_idx" ON "job_offers"("company_id");

-- CreateIndex
CREATE INDEX "job_offers_municipality_idx" ON "job_offers"("municipality");

-- CreateIndex
CREATE INDEX "job_offers_contract_type_idx" ON "job_offers"("contract_type");

-- CreateIndex
CREATE INDEX "job_offers_work_modality_idx" ON "job_offers"("work_modality");

-- CreateIndex
CREATE INDEX "job_offers_is_active_idx" ON "job_offers"("is_active");

-- CreateIndex
CREATE INDEX "job_offers_status_idx" ON "job_offers"("status");

-- CreateIndex
CREATE INDEX "job_questions_job_offer_id_idx" ON "job_questions"("job_offer_id");

-- CreateIndex
CREATE INDEX "job_questions_order_index_idx" ON "job_questions"("order_index");

-- CreateIndex
CREATE INDEX "job_applications_applicant_id_idx" ON "job_applications"("applicant_id");

-- CreateIndex
CREATE INDEX "job_applications_job_offer_id_idx" ON "job_applications"("job_offer_id");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_applicant_id_job_offer_id_key" ON "job_applications"("applicant_id", "job_offer_id");

-- CreateIndex
CREATE INDEX "job_question_answers_application_id_idx" ON "job_question_answers"("application_id");

-- CreateIndex
CREATE INDEX "job_question_answers_question_id_idx" ON "job_question_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_question_answers_application_id_question_id_key" ON "job_question_answers"("application_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_category_idx" ON "courses"("category");

-- CreateIndex
CREATE INDEX "courses_level_idx" ON "courses"("level");

-- CreateIndex
CREATE INDEX "courses_is_mandatory_idx" ON "courses"("is_mandatory");

-- CreateIndex
CREATE INDEX "courses_is_active_idx" ON "courses"("is_active");

-- CreateIndex
CREATE INDEX "courses_instructor_id_idx" ON "courses"("instructor_id");

-- CreateIndex
CREATE INDEX "course_modules_course_id_idx" ON "course_modules"("course_id");

-- CreateIndex
CREATE INDEX "course_modules_order_index_idx" ON "course_modules"("order_index");

-- CreateIndex
CREATE INDEX "lessons_module_id_idx" ON "lessons"("module_id");

-- CreateIndex
CREATE INDEX "lessons_order_index_idx" ON "lessons"("order_index");

-- CreateIndex
CREATE INDEX "course_enrollments_student_id_idx" ON "course_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "course_enrollments_course_id_idx" ON "course_enrollments"("course_id");

-- CreateIndex
CREATE INDEX "course_enrollments_status_idx" ON "course_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_student_id_course_id_key" ON "course_enrollments"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "lesson_progress_enrollment_id_idx" ON "lesson_progress"("enrollment_id");

-- CreateIndex
CREATE INDEX "lesson_progress_lesson_id_idx" ON "lesson_progress"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_enrollment_id_lesson_id_key" ON "lesson_progress"("enrollment_id", "lesson_id");

-- CreateIndex
CREATE INDEX "quizzes_course_id_idx" ON "quizzes"("course_id");

-- CreateIndex
CREATE INDEX "quizzes_lesson_id_idx" ON "quizzes"("lesson_id");

-- CreateIndex
CREATE INDEX "quiz_questions_quiz_id_idx" ON "quiz_questions"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_questions_order_index_idx" ON "quiz_questions"("order_index");

-- CreateIndex
CREATE INDEX "quiz_attempts_enrollment_id_idx" ON "quiz_attempts"("enrollment_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_quiz_id_idx" ON "quiz_attempts"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_student_id_idx" ON "quiz_attempts"("student_id");

-- CreateIndex
CREATE INDEX "quiz_answers_attempt_id_idx" ON "quiz_answers"("attempt_id");

-- CreateIndex
CREATE INDEX "quiz_answers_question_id_idx" ON "quiz_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_attempt_id_question_id_key" ON "quiz_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verification_code_key" ON "certificates"("verification_code");

-- CreateIndex
CREATE INDEX "certificates_user_id_idx" ON "certificates"("user_id");

-- CreateIndex
CREATE INDEX "certificates_course_id_idx" ON "certificates"("course_id");

-- CreateIndex
CREATE INDEX "student_notes_user_id_idx" ON "student_notes"("user_id");

-- CreateIndex
CREATE INDEX "student_notes_lesson_id_idx" ON "student_notes"("lesson_id");

-- CreateIndex
CREATE INDEX "discussions_lesson_id_idx" ON "discussions"("lesson_id");

-- CreateIndex
CREATE INDEX "discussions_user_id_idx" ON "discussions"("user_id");

-- CreateIndex
CREATE INDEX "discussions_parent_id_idx" ON "discussions"("parent_id");

-- CreateIndex
CREATE INDEX "entrepreneurships_owner_id_idx" ON "entrepreneurships"("owner_id");

-- CreateIndex
CREATE INDEX "entrepreneurships_category_idx" ON "entrepreneurships"("category");

-- CreateIndex
CREATE INDEX "entrepreneurships_municipality_idx" ON "entrepreneurships"("municipality");

-- CreateIndex
CREATE INDEX "entrepreneurships_business_stage_idx" ON "entrepreneurships"("business_stage");

-- CreateIndex
CREATE INDEX "entrepreneurships_is_active_is_public_idx" ON "entrepreneurships"("is_active", "is_public");

-- CreateIndex
CREATE UNIQUE INDEX "business_plans_entrepreneurship_id_key" ON "business_plans"("entrepreneurship_id");

-- CreateIndex
CREATE INDEX "news_articles_author_id_idx" ON "news_articles"("author_id");

-- CreateIndex
CREATE INDEX "news_articles_status_idx" ON "news_articles"("status");

-- CreateIndex
CREATE INDEX "news_articles_category_idx" ON "news_articles"("category");

-- CreateIndex
CREATE INDEX "news_articles_published_at_idx" ON "news_articles"("published_at");

-- CreateIndex
CREATE INDEX "news_articles_target_audience_idx" ON "news_articles"("target_audience");

-- CreateIndex
CREATE INDEX "news_comments_news_id_idx" ON "news_comments"("news_id");

-- CreateIndex
CREATE INDEX "news_comments_user_id_idx" ON "news_comments"("user_id");

-- CreateIndex
CREATE INDEX "news_comments_parent_id_idx" ON "news_comments"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "external_api_keys_key_key" ON "external_api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_municipality_username_key" ON "municipalities"("municipality_username");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_municipality_email_key" ON "municipalities"("municipality_email");

-- CreateIndex
CREATE INDEX "municipalities_department_idx" ON "municipalities"("department");

-- CreateIndex
CREATE INDEX "municipalities_is_active_idx" ON "municipalities"("is_active");

-- CreateIndex
CREATE INDEX "municipalities_created_by_idx" ON "municipalities"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_name_department_key" ON "municipalities"("name", "department");

-- CreateIndex
CREATE UNIQUE INDEX "municipality_username_unique" ON "municipalities"("municipality_username");

-- CreateIndex
CREATE UNIQUE INDEX "municipality_email_unique" ON "municipalities"("municipality_email");

-- CreateIndex
CREATE INDEX "companies_municipality_id_idx" ON "companies"("municipality_id");

-- CreateIndex
CREATE INDEX "companies_business_sector_idx" ON "companies"("business_sector");

-- CreateIndex
CREATE INDEX "companies_is_active_idx" ON "companies"("is_active");

-- CreateIndex
CREATE INDEX "companies_created_by_idx" ON "companies"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_municipality_id_key" ON "companies"("name", "municipality_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_questions" ADD CONSTRAINT "job_questions_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_question_answers" ADD CONSTRAINT "job_question_answers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_question_answers" ADD CONSTRAINT "job_question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "job_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "profiles"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "course_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "course_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrepreneurships" ADD CONSTRAINT "entrepreneurships_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_plans" ADD CONSTRAINT "business_plans_entrepreneurship_id_fkey" FOREIGN KEY ("entrepreneurship_id") REFERENCES "entrepreneurships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "news_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
