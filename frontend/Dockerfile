# Utilizar la imagen oficial de Nginx basada en Alpine
FROM nginx:1.25-alpine

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar la configuración optimizada del proxy inverso
COPY nginx.conf /etc/nginx/conf.d/

# Copiar los archivos estáticos HTML/JS al directorio de servicio de Nginx
COPY ./html /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Arrancar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
