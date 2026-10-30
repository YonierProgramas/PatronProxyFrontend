# Preparación para Vercel

No se ha desplegado en Vercel. Repositorio frontend oficial: https://github.com/YonierProgramas/PatronProxyFrontend. Publicar el sitio requiere una fase posterior autorizada, cuenta Vercel y backend público disponible en Render.

| Ajuste | Valor |
| --- | --- |
| Framework | Vite |
| Root Directory | raíz del repositorio frontend |
| Install | npm ci |
| Build | npm run build |
| Output | dist |
| Variable | VITE_API_BASE_URL=https://<origen real de monitor-api> |

vercel.json conserva configuración de build. No hay routing de cliente ni rewrites necesarios. VITE_ son valores públicos embebidos al compilar; no introducir secretos. La URL debe ser solo origen HTTPS en producción, sin /api. Cambios de variable requieren reconstrucción. Sin fallback silencioso a localhost. `.env.example` se usa únicamente para desarrollo local.

1. Desplegar backend y verificar health y API.
2. Configurar VITE_API_BASE_URL con URL HTTPS real.
3. Desplegar frontend desde su repositorio independiente.
4. Agregar dominio frontend real a CORS_ALLOWED_ORIGINS del monitor-api, sin comodines; volver a desplegar backend si el proveedor lo requiere.
5. Verificar operación manual con UUID, simulación +50, gráfico, filtros y estados desde el navegador público.

Pendientes: autorización para despliegues, cuentas y configuración Render/Vercel, URL API y URL frontend, prueba pública. No se han contratado planes ni creado recursos de pago. Consultar costos vigentes antes de hacerlo. La aplicación usa datos ficticios y no incluye autenticación.

Referencia oficial: [Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite). La configuración preparada no equivale a una publicación verificada.

## Backend actualizado a Render

Crear primero monitor-api público en Render y los tres negocios como Private Services, con PostgreSQL de auditoría. Los pasos y costes están en DEPLOYMENT.md del repositorio backend. La publicación de esta adaptación en GitHub está autorizada. El despliegue depende de la conexión a los proveedores y de resolver el límite del plan gratuito.

En Vercel se conserva framework Vite, root del repositorio frontend, npm ci, npm run build, salida dist. VITE_API_BASE_URL debe contener el origen HTTPS real de monitor-api en Render, sin /api y sin secretos. El dominio real de Vercel debe figurar en CORS_ALLOWED_ORIGINS del gateway. Verificar API disponible → variable frontend → despliegue Vercel autorizado → CORS → operación con UUID y simulación +50.
