FROM node:20-alpine

WORKDIR /app

EXPOSE 3000

# El comando asume que los archivos ya están ahí vía volumen
#CMD ["npm", "run", "dev", "--", "--host"]