FROM node:18-alpine

WORKDIR /app

# Instalar dependencias necesarias para compilación
RUN apk add --no-cache python3 make g++

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]

