# Usa una imagen base estable (si prefieres, sigue con alpine)
FROM node:18-bullseye

WORKDIR /app

# Instalar dependencias necesarias para compilación en Alpine
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración primero (para aprovechar la caché)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --omit=dev  # Solo instala dependencias de producción

# Copiar el resto del código
COPY . .

# Generar Prisma Client (opcionalmente dentro del CMD)
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start"]


