# 🔍 Buscador de Empresas - Documentación Completa

## 🎯 **Descripción General**

El **Buscador de Empresas** es un endpoint avanzado que permite buscar y filtrar empresas con múltiples criterios. Incluye:

- **Búsqueda por texto** en nombre, descripción, sector y representante legal
- **Filtros múltiples** por sector, tamaño, ubicación, año de fundación
- **Paginación** para manejar grandes volúmenes de datos
- **Ordenamiento** por diferentes campos
- **Filtros disponibles** para el frontend
- **Restricciones de permisos** según el tipo de usuario

## 🚀 **Endpoint Principal**

```bash
GET /api/company/search
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 **Parámetros de Búsqueda**

### **🔍 Búsqueda por Texto**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `query` | string | Busca en nombre, descripción, sector y representante legal | `"tecnología"` |

### **🏢 Filtros de Empresa**
| Parámetro | Tipo | Descripción | Valores |
|-----------|------|-------------|---------|
| `businessSector` | string | Sector de negocio | `"Tecnología"`, `"Salud"`, etc. |
| `companySize` | string | Tamaño de la empresa | `MICRO`, `SMALL`, `MEDIUM`, `LARGE` |
| `foundedYear` | integer | Año de fundación | `2020`, `2015`, etc. |
| `isActive` | boolean | Estado activo | `true`, `false` |

### **📍 Filtros de Ubicación**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `municipalityId` | string | ID del municipio específico | `"municipality123"` |
| `department` | string | Departamento | `"Cochabamba"`, `"La Paz"` |

### **📄 Paginación y Ordenamiento**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Número de página |
| `limit` | integer | `20` | Elementos por página |
| `sortBy` | string | `name` | Campo para ordenar |
| `sortOrder` | string | `asc` | Orden ascendente/descendente |

## 📊 **Ejemplos de Uso**

### **1. Búsqueda Básica**
```bash
GET /api/company/search?query=tecnología
```

### **2. Búsqueda con Filtros**
```bash
GET /api/company/search?query=software&businessSector=Tecnología&companySize=MEDIUM&department=Cochabamba
```

### **3. Búsqueda con Paginación**
```bash
GET /api/company/search?page=2&limit=10&sortBy=createdAt&sortOrder=desc
```

### **4. Búsqueda por Año de Fundación**
```bash
GET /api/company/search?foundedYear=2020&companySize=LARGE
```

### **5. Búsqueda Completa**
```bash
GET /api/company/search?query=desarrollo&businessSector=Tecnología&companySize=MEDIUM&department=Cochabamba&foundedYear=2020&page=1&limit=15&sortBy=name&sortOrder=asc
```

## 📄 **Respuesta del Endpoint**

### **Estructura de Respuesta**
```json
{
  "companies": [
    {
      "id": "company123",
      "name": "Tech Solutions Bolivia",
      "description": "Empresa de desarrollo de software",
      "taxId": "123456789",
      "legalRepresentative": "Juan Pérez",
      "businessSector": "Tecnología",
      "companySize": "MEDIUM",
      "website": "https://techsolutions.bo",
      "email": "contacto@techsolutions.bo",
      "phone": "+591 4 1234567",
      "address": "Av. Principal 123, Cochabamba",
      "foundedYear": 2020,
      "isActive": true,
      "municipalityId": "municipality456",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "municipality": {
        "id": "municipality456",
        "name": "Cochabamba",
        "department": "Cochabamba"
      },
      "creator": {
        "id": "user789",
        "username": "admin",
        "role": "SUPERADMIN"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "filters": {
    "applied": {
      "query": "tecnología",
      "businessSector": "Tecnología",
      "companySize": "MEDIUM",
      "municipalityId": null,
      "department": "Cochabamba",
      "foundedYear": null,
      "isActive": null
    },
    "available": {
      "businessSectors": [
        "Tecnología",
        "Salud",
        "Educación",
        "Comercio",
        "Manufactura"
      ],
      "companySizes": [
        "MICRO",
        "SMALL",
        "MEDIUM",
        "LARGE"
      ],
      "municipalities": [
        {
          "id": "municipality456",
          "name": "Cochabamba",
          "department": "Cochabamba"
        },
        {
          "id": "municipality789",
          "name": "La Paz",
          "department": "La Paz"
        }
      ],
      "departments": [
        "Cochabamba",
        "La Paz",
        "Santa Cruz",
        "Oruro"
      ]
    }
  }
}
```

## 🔐 **Permisos por Tipo de Usuario**

### **SuperAdmin**
- ✅ Ve **todas las empresas** (activas e inactivas)
- ✅ Puede usar **todos los filtros**
- ✅ Sin restricciones de ubicación

### **Municipal Governments**
- ✅ Ve **todas las empresas** (activas e inactivas)
- ✅ Puede usar **todos los filtros**
- ✅ Sin restricciones de ubicación

### **Municipalities**
- ❌ Ve solo empresas de **su municipio**
- ✅ Puede usar filtros pero limitado a su jurisdicción
- ❌ No puede ver empresas de otros municipios

### **Companies**
- ❌ Ve solo **su propia empresa**
- ❌ Filtros limitados a su empresa
- ❌ No puede ver otras empresas

### **Otros Usuarios (Youth, etc.)**
- ✅ Ve solo empresas **activas**
- ✅ Puede usar **todos los filtros**
- ✅ Sin restricciones de ubicación

## 📱 **Implementación en el Frontend**

### **1. Hook React para Búsqueda**
```typescript
import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  description?: string;
  businessSector?: string;
  companySize?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  foundedYear?: number;
  isActive: boolean;
  municipality: {
    id: string;
    name: string;
    department: string;
  };
}

interface SearchFilters {
  query?: string;
  businessSector?: string;
  companySize?: string;
  municipalityId?: string;
  department?: string;
  foundedYear?: number;
  isActive?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SearchResponse {
  companies: Company[];
  pagination: Pagination;
  filters: {
    applied: SearchFilters;
    available: {
      businessSectors: string[];
      companySizes: string[];
      municipalities: any[];
      departments: string[];
    };
  };
}

export const useCompanySearch = (token: string) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCompanies = async (searchParams: SearchFilters & { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // Add search parameters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`http://localhost:3001/api/company/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error searching companies');
      }

      const data: SearchResponse = await response.json();
      
      setCompanies(data.companies);
      setPagination(data.pagination);
      setFilters(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    pagination,
    filters,
    loading,
    error,
    searchCompanies
  };
};
```

### **2. Componente de Búsqueda**
```typescript
import React, { useState } from 'react';

interface CompanySearchProps {
  onSearch: (filters: any) => void;
  availableFilters: any;
  appliedFilters: any;
}

export const CompanySearch: React.FC<CompanySearchProps> = ({ 
  onSearch, 
  availableFilters, 
  appliedFilters 
}) => {
  const [filters, setFilters] = useState({
    query: appliedFilters.query || '',
    businessSector: appliedFilters.businessSector || '',
    companySize: appliedFilters.companySize || '',
    municipalityId: appliedFilters.municipalityId || '',
    department: appliedFilters.department || '',
    foundedYear: appliedFilters.foundedYear || '',
    isActive: appliedFilters.isActive || ''
  });

  const handleSearch = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      businessSector: '',
      companySize: '',
      municipalityId: '',
      department: '',
      foundedYear: '',
      isActive: ''
    });
    onSearch({});
  };

  return (
    <div className="company-search">
      <h3>Buscar Empresas</h3>
      
      <div className="search-filters">
        {/* Búsqueda por texto */}
        <div className="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Nombre, descripción, sector..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
        </div>

        {/* Sector de negocio */}
        <div className="filter-group">
          <label>Sector:</label>
          <select
            value={filters.businessSector}
            onChange={(e) => setFilters({ ...filters, businessSector: e.target.value })}
          >
            <option value="">Todos los sectores</option>
            {availableFilters.businessSectors?.map((sector: string) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        {/* Tamaño de empresa */}
        <div className="filter-group">
          <label>Tamaño:</label>
          <select
            value={filters.companySize}
            onChange={(e) => setFilters({ ...filters, companySize: e.target.value })}
          >
            <option value="">Todos los tamaños</option>
            {availableFilters.companySizes?.map((size: string) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Departamento */}
        <div className="filter-group">
          <label>Departamento:</label>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">Todos los departamentos</option>
            {availableFilters.departments?.map((dept: string) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Municipio */}
        <div className="filter-group">
          <label>Municipio:</label>
          <select
            value={filters.municipalityId}
            onChange={(e) => setFilters({ ...filters, municipalityId: e.target.value })}
          >
            <option value="">Todos los municipios</option>
            {availableFilters.municipalities?.map((municipality: any) => (
              <option key={municipality.id} value={municipality.id}>
                {municipality.name} ({municipality.department})
              </option>
            ))}
          </select>
        </div>

        {/* Año de fundación */}
        <div className="filter-group">
          <label>Año de fundación:</label>
          <input
            type="number"
            placeholder="Ej: 2020"
            value={filters.foundedYear}
            onChange={(e) => setFilters({ ...filters, foundedYear: e.target.value })}
          />
        </div>

        {/* Estado activo */}
        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>
      </div>

      <div className="search-actions">
        <button onClick={handleSearch} className="btn-primary">
          Buscar
        </button>
        <button onClick={handleReset} className="btn-secondary">
          Limpiar
        </button>
      </div>
    </div>
  );
};
```

### **3. Componente de Resultados**
```typescript
import React from 'react';

interface CompanyResultsProps {
  companies: any[];
  pagination: any;
  onPageChange: (page: number) => void;
  onSort: (sortBy: string, sortOrder: string) => void;
}

export const CompanyResults: React.FC<CompanyResultsProps> = ({ 
  companies, 
  pagination, 
  onPageChange, 
  onSort 
}) => {
  if (companies.length === 0) {
    return (
      <div className="no-results">
        <p>No se encontraron empresas con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="company-results">
      <div className="results-header">
        <h3>Resultados ({pagination.total} empresas)</h3>
        <div className="sort-controls">
          <select onChange={(e) => onSort(e.target.value, 'asc')}>
            <option value="name">Ordenar por nombre</option>
            <option value="createdAt">Ordenar por fecha</option>
            <option value="foundedYear">Ordenar por año</option>
            <option value="companySize">Ordenar por tamaño</option>
          </select>
        </div>
      </div>

      <div className="companies-grid">
        {companies.map((company) => (
          <div key={company.id} className="company-card">
            <h4>{company.name}</h4>
            <p className="sector">{company.businessSector}</p>
            <p className="size">{company.companySize}</p>
            <p className="location">{company.municipality.name}, {company.municipality.department}</p>
            {company.description && (
              <p className="description">{company.description}</p>
            )}
            <div className="company-actions">
              <button className="btn-primary">Ver detalles</button>
              <button className="btn-secondary">Contactar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </button>
          
          <span>
            Página {pagination.page} de {pagination.pages}
          </span>
          
          <button 
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🎯 **Ejemplos de Uso Completo**

### **1. Búsqueda Simple**
```javascript
const response = await fetch('http://localhost:3001/api/company/search?query=tecnología', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.companies);
```

### **2. Búsqueda Avanzada**
```javascript
const searchParams = new URLSearchParams({
  query: 'desarrollo',
  businessSector: 'Tecnología',
  companySize: 'MEDIUM',
  department: 'Cochabamba',
  page: '1',
  limit: '10',
  sortBy: 'name',
  sortOrder: 'asc'
});

const response = await fetch(`http://localhost:3001/api/company/search?${searchParams}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data);
```

### **3. Con PowerShell**
```powershell
$token = "YOUR_JWT_TOKEN"
$params = @{
    query = "tecnología"
    businessSector = "Tecnología"
    companySize = "MEDIUM"
    page = 1
    limit = 10
}

$queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/company/search?$queryString" -Method GET -Headers @{"Authorization" = "Bearer $token"}
$response | ConvertTo-Json -Depth 10
```

## ✅ **Características Destacadas**

- **🔍 Búsqueda inteligente**: Busca en múltiples campos
- **🎯 Filtros avanzados**: Sector, tamaño, ubicación, año
- **📄 Paginación**: Para manejar grandes volúmenes
- **🔄 Ordenamiento**: Por diferentes campos
- **🔐 Permisos**: Restricciones según tipo de usuario
- **📊 Filtros disponibles**: Para construir UI dinámica
- **⚡ Performance**: Consultas optimizadas con Prisma

¡El buscador de empresas está completamente implementado y listo para usar! 🚀
