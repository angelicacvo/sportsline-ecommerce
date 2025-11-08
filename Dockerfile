# Usa una imagen oficial de Node.js como base
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Compila la aplicación
RUN npm run build

# Instala PM2 globalmente
RUN npm install pm2 -g

# Expone el puerto en el que corre la app
EXPOSE 3000

# Comando para iniciar la app con PM2
CMD ["pm2-runtime", "dist/main.js"]
