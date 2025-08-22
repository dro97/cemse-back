# 🧪 Sistema de Quizzes - Documentación para Frontend

## 📋 **Índice**
1. [Modelos de Datos](#modelos-de-datos)
2. [Tipos de Preguntas](#tipos-de-preguntas)
3. [Endpoints de la API](#endpoints-de-la-api)
4. [Flujo de Completación](#flujo-de-completación)
5. [Lógica de Calificación](#lógica-de-calificación)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Estados y Permisos](#estados-y-permisos)

---

## 🗄️ **Modelos de Datos**

### **1. Quiz (Examen)**
```typescript
interface Quiz {
  id: string;
  courseId?: string;           // ID del curso (opcional)
  lessonId?: string;           // ID de la lección (opcional)
  title: string;               // Título del quiz
  description?: string;        // Descripción del quiz
  timeLimit?: number;          // Límite de tiempo en minutos
  passingScore: number;        // Puntuación mínima para aprobar (default: 70)
  showCorrectAnswers: boolean; // Mostrar respuestas correctas después
  isActive: boolean;           // Si el quiz está activo
  questions: QuizQuestion[];   // Preguntas del quiz
  attempts: QuizAttempt[];     // Intentos realizados
}
```

### **2. QuizQuestion (Pregunta)**
```typescript
interface QuizQuestion {
  id: string;
  quizId: string;              // ID del quiz al que pertenece
  question: string;            // Texto de la pregunta
  type: QuestionType;          // Tipo de pregunta
  options: string[];           // Opciones de respuesta
  correctAnswer: string;       // Respuesta correcta
  explanation?: string;        // Explicación de la respuesta
  points: number;              // Puntos que vale (default: 1)
  orderIndex: number;          // Orden de la pregunta
}
```

### **3. QuizAttempt (Intento)**
```typescript
interface QuizAttempt {
  id: string;
  enrollmentId?: string;       // ID de la inscripción (opcional)
  quizId: string;              // ID del quiz
  studentId: string;           // ID del estudiante
  startedAt: Date;             // Fecha de inicio
  completedAt?: Date;          // Fecha de finalización
  score?: number;              // Puntuación obtenida (0-100)
  passed?: boolean;            // Si aprobó o no
  timeSpent: number;           // Tiempo gastado en segundos
  answers: QuizAnswer[];       // Respuestas del estudiante
}
```

### **4. QuizAnswer (Respuesta)**
```typescript
interface QuizAnswer {
  id: string;
  attemptId: string;           // ID del intento
  questionId: string;          // ID de la pregunta
  answer: string;              // Respuesta del estudiante
  isCorrect: boolean;          // Si la respuesta es correcta
  timeSpent: number;           // Tiempo gastado en esta pregunta
}
```

---

## 🎯 **Tipos de Preguntas**

### **QuestionType Enum**
```typescript
enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",     // Opción múltiple (una respuesta)
  TRUE_FALSE = "TRUE_FALSE",               // Verdadero/Falso
  FILL_BLANK = "FILL_BLANK",               // Completar espacios
  SORT_ELEMENTS = "SORT_ELEMENTS",         // Ordenar elementos
  MULTIPLE_SELECT = "MULTIPLE_SELECT",     // Selección múltiple
  SHORT_ANSWER = "SHORT_ANSWER"            // Respuesta corta
}
```

### **Ejemplos por Tipo**

#### **MULTIPLE_CHOICE**
```typescript
{
  question: "¿Cuál es la capital de Bolivia?",
  type: "MULTIPLE_CHOICE",
  options: ["La Paz", "Sucre", "Cochabamba", "Santa Cruz"],
  correctAnswer: "La Paz",
  explanation: "La Paz es la sede del gobierno y capital administrativa de Bolivia."
}
```

#### **TRUE_FALSE**
```typescript
{
  question: "JavaScript es un lenguaje de programación orientado a objetos.",
  type: "TRUE_FALSE",
  options: ["Verdadero", "Falso"],
  correctAnswer: "Verdadero",
  explanation: "JavaScript es un lenguaje multiparadigma que incluye programación orientada a objetos."
}
```

#### **FILL_BLANK**
```typescript
{
  question: "La función para declarar variables en JavaScript es _____.",
  type: "FILL_BLANK",
  options: [], // No se usan opciones
  correctAnswer: "let",
  explanation: "La palabra clave 'let' se usa para declarar variables en JavaScript."
}
```

#### **MULTIPLE_SELECT**
```typescript
{
  question: "¿Cuáles son frameworks de JavaScript? (Selecciona todas las correctas)",
  type: "MULTIPLE_SELECT",
  options: ["React", "Angular", "Vue", "jQuery", "Bootstrap"],
  correctAnswer: "React,Angular,Vue", // Separado por comas
  explanation: "React, Angular y Vue son frameworks de JavaScript. jQuery es una librería y Bootstrap es un framework CSS."
}
```

#### **SORT_ELEMENTS**
```typescript
{
  question: "Ordena los pasos del ciclo de vida de un componente React:",
  type: "SORT_ELEMENTS",
  options: ["componentDidMount", "render", "constructor", "componentWillUnmount"],
  correctAnswer: "constructor,render,componentDidMount,componentWillUnmount",
  explanation: "El orden correcto es: constructor → render → componentDidMount → componentWillUnmount"
}
```

#### **SHORT_ANSWER**
```typescript
{
  question: "Explica brevemente qué es el DOM en desarrollo web.",
  type: "SHORT_ANSWER",
  options: [], // No se usan opciones
  correctAnswer: "Document Object Model",
  explanation: "El DOM es una representación en memoria de la estructura de un documento HTML."
}
```

---

## 🔌 **Endpoints de la API**

### **Base URL**: `http://localhost:3001/api`

### **1. Quizzes (Exámenes)**

#### **Listar Quizzes**
```http
GET /quizzes
Authorization: Bearer YOUR_JWT_TOKEN
```
**Respuesta:**
```json
[
  {
    "id": "quiz_123",
    "courseId": "course_456",
    "lessonId": null,
    "title": "Examen Final de JavaScript",
    "description": "Evaluación completa de conceptos de JavaScript",
    "timeLimit": 30,
    "passingScore": 70,
    "showCorrectAnswers": true,
    "isActive": true
  }
]
```

#### **Obtener Quiz por ID**
```http
GET /quizzes/:id
Authorization: Bearer YOUR_JWT_TOKEN
```
**Respuesta:**
```json
{
  "id": "quiz_123",
  "courseId": "course_456",
  "lessonId": null,
  "title": "Examen Final de JavaScript",
  "description": "Evaluación completa de conceptos de JavaScript",
  "timeLimit": 30,
  "passingScore": 70,
  "showCorrectAnswers": true,
  "isActive": true,
  "questions": [
    {
      "id": "q1",
      "quizId": "quiz_123",
      "question": "¿Qué es JavaScript?",
      "type": "MULTIPLE_CHOICE",
      "options": ["Un lenguaje de programación", "Un framework", "Una librería"],
      "correctAnswer": "Un lenguaje de programación",
      "explanation": "JavaScript es un lenguaje de programación interpretado.",
      "points": 1,
      "orderIndex": 1
    }
  ]
}
```

#### **Crear Quiz** (Solo SuperAdmin y Organizaciones)
```http
POST /quizzes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "courseId": "course_456",
  "lessonId": null,
  "title": "Nuevo Quiz",
  "description": "Descripción del quiz",
  "timeLimit": 30,
  "passingScore": 70,
  "showCorrectAnswers": true,
  "isActive": true
}
```

### **2. Quiz Questions (Preguntas)**

#### **Listar Preguntas**
```http
GET /quiz-questions
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Obtener Pregunta por ID**
```http
GET /quiz-questions/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Crear Pregunta** (Solo SuperAdmin y Organizaciones)
```http
POST /quiz-questions
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "quizId": "quiz_123",
  "question": "¿Cuál es la capital de Bolivia?",
  "type": "MULTIPLE_CHOICE",
  "options": ["La Paz", "Sucre", "Cochabamba", "Santa Cruz"],
  "correctAnswer": "La Paz",
  "explanation": "La Paz es la sede del gobierno.",
  "points": 1,
  "orderIndex": 1
}
```

### **3. Quiz Attempts (Intentos)**

#### **Listar Intentos del Estudiante**
```http
GET /quiz-attempts
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Obtener Intento por ID**
```http
GET /quiz-attempts/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Completar Quiz** ⭐ **ENDPOINT PRINCIPAL**
```http
POST /quiz-attempts/complete
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "quizId": "quiz_123",
  "enrollmentId": "enrollment_456",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Un lenguaje de programación",
      "timeSpent": 45
    },
    {
      "questionId": "q2",
      "answer": "Verdadero",
      "timeSpent": 30
    }
  ]
}
```

**Respuesta:**
```json
{
  "id": "attempt_789",
  "enrollmentId": "enrollment_456",
  "quizId": "quiz_123",
  "studentId": "student_123",
  "startedAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:15:00Z",
  "score": 85,
  "passed": true,
  "timeSpent": 900,
  "answers": [
    {
      "id": "answer_1",
      "questionId": "q1",
      "answer": "Un lenguaje de programación",
      "isCorrect": true,
      "timeSpent": 45
    },
    {
      "id": "answer_2",
      "questionId": "q2",
      "answer": "Verdadero",
      "isCorrect": true,
      "timeSpent": 30
    }
  ]
}
```

---

## 🔄 **Flujo de Completación**

### **1. Inicio del Quiz**
```typescript
// 1. Obtener el quiz con sus preguntas
const quiz = await fetch(`/api/quizzes/${quizId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json());

// 2. Mostrar información del quiz
console.log(`Quiz: ${quiz.title}`);
console.log(`Tiempo límite: ${quiz.timeLimit} minutos`);
console.log(`Puntuación mínima: ${quiz.passingScore}%`);
console.log(`Preguntas: ${quiz.questions.length}`);
```

### **2. Durante el Quiz**
```typescript
// Estructura para almacenar respuestas
const answers: QuizAnswer[] = [];
let startTime = Date.now();

// Para cada pregunta
const handleAnswer = (questionId: string, answer: string, timeSpent: number) => {
  answers.push({
    questionId,
    answer,
    timeSpent
  });
};
```

### **3. Finalización del Quiz**
```typescript
// Calcular tiempo total
const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);

// Enviar respuestas
const result = await fetch('/api/quiz-attempts/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quizId: quiz.id,
    enrollmentId: enrollment.id,
    answers: answers
  })
}).then(res => res.json());

// Mostrar resultados
console.log(`Puntuación: ${result.score}%`);
console.log(`Aprobado: ${result.passed ? 'Sí' : 'No'}`);
console.log(`Tiempo: ${result.timeSpent} segundos`);
```

---

## 📊 **Lógica de Calificación**

### **Cálculo de Puntuación**
```typescript
// Fórmula utilizada en el backend
const calculateScore = (correctAnswers: number, totalQuestions: number): number => {
  return Math.round((correctAnswers / totalQuestions) * 100);
};

// Ejemplo
const correctAnswers = 7;
const totalQuestions = 10;
const score = calculateScore(correctAnswers, totalQuestions); // 70%
```

### **Determinación de Aprobación**
```typescript
// Un estudiante aprueba si su puntuación >= passingScore
const passed = score >= quiz.passingScore; // default: 70%
```

### **Procesamiento por Tipo de Pregunta**

#### **MULTIPLE_CHOICE & TRUE_FALSE**
```typescript
// Comparación exacta
const isCorrect = studentAnswer === question.correctAnswer;
```

#### **MULTIPLE_SELECT**
```typescript
// Las respuestas vienen separadas por comas
const correctAnswers = question.correctAnswer.split(',');
const studentAnswers = studentAnswer.split(',');
const isCorrect = correctAnswers.length === studentAnswers.length &&
                  correctAnswers.every(ans => studentAnswers.includes(ans));
```

#### **SORT_ELEMENTS**
```typescript
// Comparación exacta del orden
const isCorrect = studentAnswer === question.correctAnswer;
```

#### **FILL_BLANK & SHORT_ANSWER**
```typescript
// Comparación exacta (case-sensitive)
const isCorrect = studentAnswer === question.correctAnswer;
```

---

## 🎯 **Ejemplos de Uso**

### **Ejemplo 1: Quiz Básico de Opción Múltiple**
```typescript
// Crear quiz
const quiz = {
  title: "Fundamentos de JavaScript",
  description: "Evaluación básica de conceptos de JavaScript",
  timeLimit: 15,
  passingScore: 70,
  showCorrectAnswers: true,
  isActive: true
};

// Crear preguntas
const questions = [
  {
    question: "¿Qué significa DOM?",
    type: "MULTIPLE_CHOICE",
    options: ["Document Object Model", "Data Object Model", "Dynamic Object Model"],
    correctAnswer: "Document Object Model",
    explanation: "DOM significa Document Object Model.",
    points: 1,
    orderIndex: 1
  },
  {
    question: "JavaScript es un lenguaje de programación.",
    type: "TRUE_FALSE",
    options: ["Verdadero", "Falso"],
    correctAnswer: "Verdadero",
    explanation: "JavaScript es un lenguaje de programación interpretado.",
    points: 1,
    orderIndex: 2
  }
];
```

### **Ejemplo 2: Quiz Completo con Respuestas**
```typescript
// Respuestas del estudiante
const studentAnswers = [
  {
    questionId: "q1",
    answer: "Document Object Model",
    timeSpent: 30
  },
  {
    questionId: "q2",
    answer: "Verdadero",
    timeSpent: 15
  }
];

// Enviar para calificación
const result = await fetch('/api/quiz-attempts/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quizId: "quiz_123",
    enrollmentId: "enrollment_456",
    answers: studentAnswers
  })
});

// Resultado esperado
// {
//   "score": 100,
//   "passed": true,
//   "timeSpent": 45,
//   "answers": [
//     { "isCorrect": true, "timeSpent": 30 },
//     { "isCorrect": true, "timeSpent": 15 }
//   ]
// }
```

---

## 🔐 **Estados y Permisos**

### **Permisos por Rol**

#### **Estudiantes (YOUTH, ADOLESCENTS)**
- ✅ Ver quizzes disponibles
- ✅ Tomar quizzes
- ✅ Ver sus propios intentos
- ✅ Ver resultados de sus intentos
- ❌ Crear/editar quizzes
- ❌ Ver intentos de otros estudiantes

#### **Organizaciones (COMPANIES, MUNICIPAL_GOVERNMENTS, etc.)**
- ✅ Ver todos los quizzes
- ✅ Crear/editar quizzes
- ✅ Ver todos los intentos
- ✅ Ver estadísticas
- ❌ Eliminar quizzes

#### **SuperAdmin**
- ✅ Todas las operaciones
- ✅ Eliminar quizzes
- ✅ Ver todos los datos

### **Estados del Quiz**

#### **isActive**
- `true`: Quiz disponible para tomar
- `false`: Quiz deshabilitado

#### **showCorrectAnswers**
- `true`: Mostrar respuestas correctas después de completar
- `false`: No mostrar respuestas correctas

### **Estados del Intento**

#### **passed**
- `true`: Estudiante aprobó el quiz
- `false`: Estudiante no aprobó el quiz
- `null`: Quiz aún no completado

#### **score**
- `0-100`: Puntuación porcentual
- `null`: Quiz aún no completado

---

## 🚀 **Implementación en Frontend**

### **React/TypeScript Example**
```typescript
interface QuizState {
  currentQuestion: number;
  answers: QuizAnswer[];
  timeRemaining: number;
  isCompleted: boolean;
}

const QuizComponent: React.FC<{ quizId: string }> = ({ quizId }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    answers: [],
    timeRemaining: 0,
    isCompleted: false
  });

  useEffect(() => {
    // Cargar quiz
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    const response = await fetch(`/api/quizzes/${quizId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const quizData = await response.json();
    setQuiz(quizData);
    setState(prev => ({ ...prev, timeRemaining: quizData.timeLimit * 60 }));
  };

  const handleAnswer = (answer: string, timeSpent: number) => {
    const question = quiz?.questions[state.currentQuestion];
    if (!question) return;

    setState(prev => ({
      ...prev,
      answers: [...prev.answers, { questionId: question.id, answer, timeSpent }],
      currentQuestion: prev.currentQuestion + 1
    }));
  };

  const completeQuiz = async () => {
    const response = await fetch('/api/quiz-attempts/complete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quizId: quiz?.id,
        enrollmentId: enrollmentId,
        answers: state.answers
      })
    });

    const result = await response.json();
    setState(prev => ({ ...prev, isCompleted: true }));
    
    // Mostrar resultados
    alert(`Puntuación: ${result.score}% - ${result.passed ? 'Aprobado' : 'No aprobado'}`);
  };

  return (
    <div>
      {quiz && !state.isCompleted && (
        <div>
          <h2>{quiz.title}</h2>
          <p>Tiempo restante: {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}</p>
          
          {state.currentQuestion < quiz.questions.length && (
            <QuestionComponent
              question={quiz.questions[state.currentQuestion]}
              onAnswer={handleAnswer}
            />
          )}
          
          {state.currentQuestion >= quiz.questions.length && (
            <button onClick={completeQuiz}>Completar Quiz</button>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 📝 **Notas Importantes**

1. **Autenticación**: Todos los endpoints requieren JWT token
2. **Tiempo**: El tiempo se maneja en segundos
3. **Puntuación**: Se calcula como porcentaje (0-100)
4. **Aprobación**: Por defecto requiere 70% o más
5. **Respuestas**: Se envían todas juntas al completar el quiz
6. **Validación**: El backend valida que todas las preguntas tengan respuesta
7. **Persistencia**: Los intentos se guardan automáticamente al completar

---

## 🔧 **Troubleshooting**

### **Errores Comunes**

#### **400 - Missing required fields**
```json
{
  "message": "Missing required fields: quizId, enrollmentId, answers, and user must be authenticated"
}
```
**Solución**: Asegúrate de enviar todos los campos requeridos.

#### **404 - Quiz not found**
```json
{
  "message": "Quiz not found"
}
```
**Solución**: Verifica que el quizId sea correcto y que el quiz esté activo.

#### **403 - Access denied**
```json
{
  "message": "Access denied. Only SuperAdmin and organizations can create resources"
}
```
**Solución**: Verifica que el usuario tenga los permisos necesarios.

#### **401 - Authentication required**
```json
{
  "message": "Authentication required"
}
```
**Solución**: Incluye el token JWT en el header Authorization.
