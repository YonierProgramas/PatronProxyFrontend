# QA manual pendiente de navegador

Estas comprobaciones se preparan para ejecución humana; no se declaran aprobadas mediante mocks.

- [ ] Abrir desktop y móvil; tarjetas, gráfica, tabla sin cortes, scroll horizontal solo en tabla si corresponde.
- [ ] Base nueva: tres tarjetas con 0 y Sin datos, gráfico vacío y cero logs.
- [ ] Configuración ausente: aviso VITE_API_BASE_URL comprensible.
- [ ] Backend apagado: Sin conexión con el backend; sin datos simulados.
- [ ] Ejecutar cada operación manual, recuperar pedidos/pagos por UUID, validar cantidades e importes.
- [ ] Localizar requestId manual y expandir parámetros, respuesta y errores.
- [ ] Simular carga: botón deshabilitado durante ejecución, resumen final, total +50 con DB disponible.
- [ ] Confirmar series separadas, tooltip y unidad ms, últimas 20 por servicio.
- [ ] Filtrar servicio+estado+fechas; limpiar; cambiar página; polling conserva página.
- [ ] Rango invertido: mensaje de validación antes de consulta.
- [ ] Error rate 15% no alerta; superior a 15% muestra etiqueta y borde rojo (cubierto además por test determinista).
- [ ] Detener backend después de tener datos: conservar vista anterior con aviso.
- [ ] Pestaña oculta: pausa; al volver actualiza al siguiente ciclo, sin intervalos duplicados.
- [ ] Navegación por teclado, botón de expandir y campos con etiquetas.
- [ ] Frontend y API públicos: CORS, HTTPS, health, UUID y +50 reales.

Prueba automatizada HTTP real: backend/tools/smoke.py. Solo usarla con base nueva y cuatro servicios arrancados. Validación visual en navegador y flujo UI público quedan separados de esa prueba HTTP.
