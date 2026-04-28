FROM node:20-alpine

WORKDIR /app

EXPOSE 5173

# El comando asume que los archivos ya están ahí vía volumen
CMD ["npm", "run", "dev", "--", "--host"]