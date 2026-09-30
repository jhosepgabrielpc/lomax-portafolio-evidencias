# Utilizar una imagen base ligera de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias de producción de forma limpia
RUN npm ci --only=production

# Copiar el código fuente del microservicio
COPY . .

# Exponer el puerto interno configurado para la API
EXPOSE 3000

# Definir variables de entorno por defecto para el contenedor
ENV NODE_ENV=production
ENV PORT=3000

# Comando de arranque del servidor
CMD ["node", "server.js"]
