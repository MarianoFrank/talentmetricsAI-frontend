# TalentMetrics AI - Frontend

Este es el frontend de **TalentMetrics AI**, una plataforma de evaluación de competencias TIC. El proyecto forma parte del Seminario Final para la carrera de **Analista Universitario de Sistemas** en la **UTN FRsf**.

## Tecnologías Principales

- **React** + **Vite**: Motor principal y entorno de desarrollo rápido.
- **Tailwind CSS v4**: Estilizado moderno y utilitario.
- **PrimeReact**: Suite de componentes UI profesionales para la interfaz de gestión.
- **React Router Dom**: Gestión de navegación SPA.
- **Docker**: Contenerización para un entorno de desarrollo consistente.

## Requisitos Previos

- **Docker** y **Docker Compose** instalados.

## Instalación y Uso

1. Clonar el repositorio:

```bash
   git clone https://github.com/MarianoFrank/talentmetricsAI-frontend
   cd talentmetricsAI-frontend
```

2. Levantar el entorno con Docker:

```bash
docker compose up --build
```

3. La app estará disponible en http://localhost:5173.

## Comandos mantenimiento y desarrollo

```bash
#Abrir una terminal (sh/bash) en el contenedor
docker exec -it <nombre_del_contenedor> sh

docker logs -f <nombre_del_contenedor>

#Ciclo de vida
docker compose down -v

docker compose restart
```
