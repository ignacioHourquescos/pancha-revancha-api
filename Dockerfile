FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++ gcc

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias con flags específicos para evitar errores
RUN npm ci --legacy-peer-deps --production

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 