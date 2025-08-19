# 🎨 Frontend API Documentation

## 📋 **Quick Start for Frontend Developers**

### **Base URLs**
```javascript
// Development
const API_BASE = 'http://localhost:3001/api';

// Production  
const API_BASE = 'https://back-end-production-17b6.up.railway.app/api';
```

### **Authentication Setup**
```javascript
// Store token after login
localStorage.setItem('token', response.data.accessToken);

// Add to all requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

---

## 🔐 **Authentication Endpoints**

### **Login**
```javascript
// POST /api/auth/login
const login = async (username, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};
```

### **Register**
```javascript
// POST /api/auth/register
const register = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

### **Get Current User**
```javascript
// GET /api/auth/me
const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

---

## 👥 **User Management**

### **Get User Profile**
```javascript
// GET /api/profiles/{id}
const getUserProfile = async (userId) => {
  const response = await fetch(`${API_BASE}/profiles/${userId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Update Profile**
```javascript
// PUT /api/profiles/{id}
const updateProfile = async (userId, profileData) => {
  const response = await fetch(`${API_BASE}/profiles/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};
```

---

## 📚 **Courses**

### **Get All Courses**
```javascript
// GET /api/courses
const getCourses = async () => {
  const response = await fetch(`${API_BASE}/courses`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Get Course by ID**
```javascript
// GET /api/courses/{id}
const getCourse = async (courseId) => {
  const response = await fetch(`${API_BASE}/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Create Course** (Organizations only)
```javascript
// POST /api/courses
const createCourse = async (courseData) => {
  const response = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(courseData)
  });
  return response.json();
};
```

---

## 🎓 **Lessons**

### **Get Lessons by Course**
```javascript
// GET /api/lessons?courseId={courseId}
const getLessonsByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE}/lessons?courseId=${courseId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Get Lesson by ID**
```javascript
// GET /api/lessons/{id}
const getLesson = async (lessonId) => {
  const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

---

## 🧪 **Quizzes**

### **Get Quizzes by Course**
```javascript
// GET /api/quizzes?courseId={courseId}
const getQuizzesByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE}/quizzes?courseId=${courseId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Submit Quiz Attempt**
```javascript
// POST /api/quiz-attempts
const submitQuizAttempt = async (quizData) => {
  const response = await fetch(`${API_BASE}/quiz-attempts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quizData)
  });
  return response.json();
};
```

---

## 💼 **Job Offers**

### **Get All Job Offers**
```javascript
// GET /api/job-offers
const getJobOffers = async () => {
  const response = await fetch(`${API_BASE}/job-offers`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Apply for Job**
```javascript
// POST /api/job-applications
const applyForJob = async (applicationData) => {
  const response = await fetch(`${API_BASE}/job-applications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(applicationData)
  });
  return response.json();
};
```

---

## 📰 **News & Articles**

### **Get News Articles**
```javascript
// GET /api/news-articles
const getNewsArticles = async () => {
  const response = await fetch(`${API_BASE}/news-articles`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

### **Get Article Comments**
```javascript
// GET /api/news-comments?articleId={articleId}
const getArticleComments = async (articleId) => {
  const response = await fetch(`${API_BASE}/news-comments?articleId=${articleId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.json();
};
```

---

## 🔌 **Real-time Updates (Socket.IO)**

### **Connect to Socket.IO**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

// Listen for real-time updates
socket.on('course:updated', (data) => {
  console.log('Course updated:', data);
  // Update your UI here
});

socket.on('lesson:created', (data) => {
  console.log('New lesson created:', data);
  // Add new lesson to UI
});

// Join role-based room
socket.emit('join-room', 'JOVENES');
```

---

## 🛠️ **Error Handling**

### **Global Error Handler**
```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await refreshToken();
        // Retry the request
        return apiCall(url, options);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### **Token Refresh**
```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};
```

---

## 📊 **Data Models**

### **User Profile**
```javascript
const profileExample = {
  id: "user123",
  username: "juan_perez",
  email: "juan@example.com",
  role: "JOVENES", // JOVENES, ADOLESCENTES, EMPRESAS, etc.
  firstName: "Juan",
  lastName: "Pérez",
  documentNumber: "12345678",
  phone: "+573001234567",
  dateOfBirth: "2000-01-01",
  gender: "MALE", // MALE, FEMALE, OTHER
  address: "Calle 123 #45-67",
  city: "Bogotá",
  department: "Cundinamarca",
  country: "Colombia",
  educationLevel: "SECONDARY", // PRIMARY, SECONDARY, TECHNICAL, UNIVERSITY
  occupation: "Estudiante",
  interests: ["tecnología", "programación"],
  skills: ["JavaScript", "React"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};
```

### **Course**
```javascript
const courseExample = {
  id: "course123",
  title: "Programación Web",
  slug: "programacion-web",
  description: "Aprende a crear sitios web modernos",
  duration: 120, // minutes
  level: "BEGINNER", // BEGINNER, INTERMEDIATE, ADVANCED
  category: "TECHNOLOGY",
  isMandatory: false,
  isActive: true,
  price: 0,
  rating: 4.5,
  studentsCount: 150,
  completionRate: 85,
  totalLessons: 12,
  totalQuizzes: 4,
  totalResources: 8,
  tags: ["web", "programación", "html", "css"],
  certification: true,
  includedMaterials: ["PDFs", "Videos", "Ejercicios"],
  instructorId: "instructor123",
  institutionName: "Centro de Formación XYZ",
  publishedAt: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};
```

---

## 🎯 **Role-Based Access**

### **User Roles**
```javascript
const USER_ROLES = {
  JOVENES: 'JOVENES',           // Young people (students)
  ADOLESCENTES: 'ADOLESCENTES', // Adolescents (students)
  EMPRESAS: 'EMPRESAS',         // Companies
  GOBIERNOS_MUNICIPALES: 'GOBIERNOS_MUNICIPALES',
  CENTROS_DE_FORMACION: 'CENTROS_DE_FORMACION',
  ONGS_Y_FUNDACIONES: 'ONGS_Y_FUNDACIONES',
  CLIENT: 'CLIENT',             // General clients
  AGENT: 'AGENT',               // Service agents
  SUPER_ADMIN: 'SUPER_ADMIN'    // System administrator
};
```

### **Check User Permissions**
```javascript
const checkPermission = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

// Example usage
const canCreateCourse = checkPermission(user.role, [
  'EMPRESAS', 
  'CENTROS_DE_FORMACION', 
  'SUPER_ADMIN'
]);
```

---

## 🚀 **Quick Examples**

### **React Hook Example**
```javascript
import { useState, useEffect } from 'react';

const useApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Usage
const { data: courses, loading, error } = useApi('/courses');
```

### **Vue.js Example**
```javascript
// composables/useApi.js
import { ref, onMounted } from 'vue';

export function useApi(endpoint) {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      data.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchData);

  return { data, loading, error, refetch: fetchData };
}
```

---

## 📱 **Mobile App Integration**

### **React Native Example**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://back-end-production-17b6.up.railway.app/api';

const apiCall = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  return response.json();
};
```

---

## 🔗 **Useful Links**

- **Swagger UI**: `http://localhost:3001/api-docs`
- **API Base URL**: `http://localhost:3001/api`
- **Socket.IO**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`

---

## 📞 **Support**

For questions about the API:
- Check the Swagger documentation first
- Review this frontend guide
- Contact the backend team

**Happy coding! 🚀** 