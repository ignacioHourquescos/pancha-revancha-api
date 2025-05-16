FROM node:20.9.0


WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --force

# Copiar el resto de los archivos
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Exponer el puerto que Railway usará
EXPOSE ${PORT}

# Comando para iniciar la aplicación
CMD ["npm", "start"] 