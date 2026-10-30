# Monitor de microservicios — frontend

## Repositorios oficiales

- Backend: https://github.com/YonierProgramas/PatronProxyBackend
- Frontend: https://github.com/YonierProgramas/PatronProxyFrontend

Cada proyecto tiene su propio repositorio Git y rama `main`, con sus archivos directamente en la raíz. La carpeta superior no es un repositorio del taller. Render y Vercel permanecen sin despliegue verificado; ver DEPLOYMENT_STATUS.md para los bloqueos de conexión y plan.

Dashboard React + TypeScript estricto + Vite + Recharts, interfaz en español. Proyecto independiente del backend, sin repositorio superior. No contiene datos falsos ni métricas inventadas. API mediante VITE_API_BASE_URL (solo origen, sin /api). Error visible si falta configuración.

## Ejecución

Requisitos: Node 22.12+ y npm. Iniciar primero las cuatro aplicaciones del backend.

### Windows PowerShell

```powershell
Set-Location 'C:\Users\Jhonier\OneDrive\Documentos\Proxy\microservices-monitor-frontend'
npm ci
Copy-Item .env.example .env.local
npm run build
npm test
.\tools\start.ps1
```

### WSL / Bash

```bash
cd '/mnt/c/Users/Jhonier/OneDrive/Documentos/Proxy/microservices-monitor-frontend'
npm ci
cp .env.example .env.local
npm run build
npm test
bash tools/start.sh
```

Abrir http://localhost:5173. Detener el frontend con Ctrl+C en su terminal; no mata procesos ajenos. Puerto ocupado: Vite con strictPort falla en lugar de iniciar un duplicado. Cambiar FRONTEND_PORT si es necesario y actualizar CORS del backend. Los scripts comprueban herramientas, dependencias y archivo de entorno. No sobrescribir `.env.local` existente al repetir la instalación.

## Organización

- src/api/client.ts: URL centralizada, errores, cancelación, rutas con /api una vez.
- src/hooks/useDashboard.ts: polling nominal 3000 ms tras completar cada consulta, sin solapamiento, abort al cambiar filtros o desmontar, mantiene datos anteriores y página. Pausa si pestaña oculta; refresca al siguiente ciclo visible.
- src/components/ServiceCards.tsx: tres tarjetas, null = Sin datos, atención solo >15% y etiqueta accesible.
- src/components/DurationChart.tsx: tres series, hasta 20 puntos por servicio, tooltip real y ms.
- src/components/AuditTable.tsx: filtros combinados, fechas locales convertidas a UTC, paginación backend, detalles JSON seguros por React y button accesible.
- src/components/OperationPanel.tsx: todas las operaciones de demostración con campos concretos.
- src/pages/Dashboard.tsx: simulación real, estados y actualización tras acciones.
- src/styles/global.css: diseño responsive claro con acento violeta.

Los filtros se aplican con Filtrar; no alteran tarjetas ni gráfica. Mientras se actualizan se conserva la consulta previa y se informa. Fechas locales en formulario y visualización; API ISO 8601 UTC inclusiva. El gráfico ordena cronológicamente los puntos de cada serie. Los errores no generan valores ficticios. Una desconexión conserva último resultado con aviso explícito.

El límite de simulación se aplica en backend. La interfaz deshabilita el botón durante la solicitud; no genera lotes por polling. Un lote pequeño puede tener cualquier proporción de fallos: cada pago válido tiene probabilidad 10%. Un error de validación de negocio mantiene requestId. No se solicitan tarjetas, cuentas ni datos personales.

## Verificación y entrega

`npm test`: Vitest/Testing Library, un worker. `npm run build`: TypeScript y Vite. [Resultados reales](TEST_REPORT.md), [QA manual](MANUAL_QA.md), [Vercel](DEPLOYMENT.md). Versiones efectivas fijadas en package-lock.json. No hay rutas de cliente: no se necesita rewrite SPA.

Decisiones técnicas frontend son elecciones de implementación; no se atribuyen literalmente al profesor. Entrega requiere repositorios backend/frontend separados y ambas URL públicas verificadas. Los repositorios GitHub oficiales se indican arriba; el despliegue Vercel sigue pendiente por instrucción del usuario.
