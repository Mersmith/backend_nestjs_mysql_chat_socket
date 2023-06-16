# - DEVELOPMENT -
# Establecer la imagen base
FROM node:18 AS development

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de configuración del proyecto
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el código fuente del proyecto
COPY . .

RUN npm run build

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
#CMD ["npm", "run", "start:dev"]

# - PRODUCTION -
FROM node:18 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --from=development /app .

EXPOSE 8080

CMD ["node", "dist/main"]