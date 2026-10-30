# Informe de pruebas frontend

Fecha: 30 de octubre de 2026 (America/Bogota). Node 22.16.0, npm 10.9.2; versiones efectivas del lockfile: React 19.3.1, TypeScript 5.9.3, Vite 7.3.7, Recharts 3.10.1, Vitest 3.2.7. No se instalaron herramientas globales.

## Resultados ejecutados

- `npm install --cache /tmp/proxy-tools/npm-cache --no-audit --no-fund`: correcto, 199 paquetes, package-lock.json generado. No se hizo auditoría npm de vulnerabilidades; --no-audit no equivale a certificación de seguridad.
- `npm run build`: **correcto**, TypeScript estricto y producción Vite. Salida dist, 626 módulos transformados. Bundle separado en aplicación 16.65 kB, React 222.29 kB y gráficas 373.59 kB (sin gzip); última compilación sin advertencia de chunk >500 kB. Tamaños pueden variar ligeramente con cambios de formato.
- `npm test`: **14/14** en tres suites iniciales tras corregir selectores ambiguos.
- `npm test -- tests/client.test.ts tests/polling.test.tsx`: **9/9** en dos suites, tras añadir configuración API y regresión de fallo parcial.
- `npm test -- tests/client.test.ts`: **5/5**, incluyendo respuesta JSON inválida con error en español.
- **20 pruebas distintas aprobadas**, cuatro archivos. Las ejecuciones selectivas repiten casos; no sumar sus conteos como pruebas distintas.

| Archivo | Casos finales | Cobertura |
| --- | ---: | --- |
| dashboard.test.tsx | 8 | Tres tarjetas, null, traducciones, umbral 15%, tabla, detalle, filtros, fechas y paginación |
| polling.test.tsx | 5 | 3000 ms, página estable, cancelación, limpieza, respuestas antiguas, desconexión, no solapamiento incluso con fallo parcial |
| actions.test.tsx | 2 | Operación manual API y requestId; simulación solo al pulsar, deshabilitado y resumen |
| client.test.ts | 5 | URL ausente sin fetch, rutas centralizadas, filtros UTC, error tipado, desconexión y JSON inválido en español |

Vitest usa maxWorkers=1 y fileParallelism=false. Pruebas de componentes/polling usan Testing Library, mocks y temporizadores controlados. No se presentan como pruebas de API remota real. Los tests API usan fetch simulado. JSDOM y la lectura de node_modules en OneDrive/WSL hicieron lentas las preparaciones: primera suite completa ~287 s, selección adicional ~110 s; los casos propiamente dichos duraron menos de 2 s en cada ejecución.

## Correcciones verificadas

Las primeras pruebas de tabla encontraron selectores ambiguos: “Éxito”/“Error” existen en filtro y badge. Se corrigió el selector para verificar el badge, manteniendo ambas funciones. No se eliminaron pruebas. El polling espera ambas promesas con allSettled antes de programar el siguiente ciclo, incluso si una falla; regresión aprobada.

Un intento de build lanzado antes de finalizar npm install encontró un TypeScript global Windows incompatible. Al terminar la instalación se usó el TypeScript local del proyecto y build pasó. No se instaló ni modificó TypeScript global.

## Integración real y límites

Se sirvió Vite en 5173 con VITE_API_BASE_URL=http://localhost:8080; HTML HTTP 200. Los cuatro servicios backend se ejecutaron de verdad, API /actuator/health UP, y la prueba HTTP real confirmó una operación manual y +50 registros (49 éxitos, 1 error) desde base nueva. También se verificó CORS preflight, persistencia después de reinicio y operaciones reales de inventario, pedido y pago. Evidencias JSON en el proyecto backend: docs/SMOKE_RESULT.json y docs/RESTART_RESULT.json.

**No se realizó QA visual ni clics reales de navegador**, ni se publicó en Vercel/Railway. Esas comprobaciones están pendientes en MANUAL_QA.md. Tests con mocks, servir HTML y prueba HTTP son niveles distintos de validación. Tampoco se ejecutaron scripts PowerShell ni PostgreSQL/Docker. Los procesos de verificación se detienen al terminar; instrucciones de ejecución en README.

## Verificación completa previa a GitHub (30 de octubre de 2026)

Nueva ejecución `npm test`: **4 suites aprobadas, 20/20 pruebas** en una sola ejecución (265.22 s, preparación JSDOM/OneDrive predominante). `npm run build`: **correcto**, TypeScript estricto y Vite; 626 módulos, chunks de aplicación 16.65 kB, React 222.29 kB y gráficas 373.59 kB. Los resultados anteriores se conservan como historial, sin sumar pruebas repetidas.

Se revisaron `.gitignore`, archivos del índice y origen oficial: ningún .env privado, credencial, node_modules, dist o target se incluye. `.env.example` y package-lock.json se conservan. No se efectuó despliegue Vercel ni Railway.
