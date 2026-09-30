# Portafolio de Evidencias Técnicas - Lomax
**Estudiante:** Jhosep Gabriel Peña Callisaya  
**Carrera:** Ingeniería de Sistemas  
**Institución:** Universidad del Valle (Univalle)  

---

## Estructura del Portafolio (Evidencias E1 a E7)

### Etapa 1: Arquitectura y Diseño (E1)
* **Descripción:** Modelado del sistema e infraestructura orientada a microservicios en contenedores.
* **Evidencias:** Diagramas de componentes, diseño de flujos e infraestructura base (docker-compose.yml).

### Etapa 2: Base de Datos Relacional - RDS PostgreSQL (E2)
* **Descripción:** Gestión de entidades relacionales, productos, categorías y control de estados.
* **Evidencias:** 
  * schema.sql: Estructura de tablas y esquemas.
  * carga_rds.sql: Datos semilla iniciales del catálogo.

### Etapa 3: Almacenamiento NoSQL y S3 (E3)
* **Descripción:** Configuración de DynamoDB Local y LocalStack S3 para manejo de atributos y miniaturas.
* **Evidencias:** Scripts de creación de tablas NoSQL y buckets de almacenamiento.

### Etapa 4: Microservicio Backend (E4)
* **Descripción:** API REST desarrollada en Node.js para la gestión de transacciones e intermediación con bases de datos.
* **Evidencias:** Código fuente en ackend_api/, Dockerfile y lógica de rutas.

### Etapa 5: Interfaz Frontend y Proxy (E5)
* **Descripción:** Interfaz web responsiva con Tailwind CSS y motor Nginx.
* **Evidencias:** Código fuente en rontend/html/ (index.html, egistro.html, detalle.html).

### Etapa 6: Orquestación y Despliegue - K8s / EKS (E6)
* **Descripción:** Manifiestos de Kubernetes para despliegue en entornos simulados de AWS EKS.
* **Evidencias:** ackend-deployment.yaml, rontend-deployment.yaml y configuraciones de ambiente.

### Etapa 7: Pruebas de Resiliencia y Validación (E7)
* **Descripción:** Pruebas de integración, persistencia ante reinicios de contenedores y validación de miniaturas.
* **Evidencias:** Capturas de verificación en RDS, DynamoDB y S3.
