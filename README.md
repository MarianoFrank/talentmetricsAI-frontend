
# TalentMetrics AI - Frontend

Este repositorio contiene la interfaz de usuario (Single Page Application) del proyecto TalentMetrics AI. Está desarrollado con **React** y **Vite**, usando **Node.js 24**.

## 🛠️ Requisitos Previos

*   **Node.js:** Versión 24.
*   **Backend Activo:** Asegurate de tener corriendo el repositorio del backend de TalentMetrics AI para que la interfaz pueda consumir los datos.

## ⚙️ Configuración del Entorno

Para que el cliente de React se comunique correctamente con la API, debés crear un archivo `.env` en la raíz de este repositorio con el siguiente formato:

```env
VITE_APP_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:8080
```


### Instalar las dependencias
```bash
npm install
```
### Levantar el proyecto
```bash
npm run dev
```
La aplicación estará disponible en tu navegador ingresando a http://localhost:3000.
