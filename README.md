# AppWeb Directus Pro - Informes mensuales

Aplicación web responsive conectada a Directus en `http://100.105.113.77:8055`.

## Incluye

- Login con usuario y contraseña de Directus.
- Prueba de conexión API.
- Gestión de contratos: crear, editar, eliminar y listar.
- Gestión de obligaciones asociadas a cada contrato.
- Gestión de informes mensuales asociados a cada contrato.
- Al abrir Informes de un contrato, la app carga automáticamente las obligaciones de ese contrato para tenerlas como referencia durante la creación del informe mensual.

## Uso

1. Descomprime el ZIP.
2. Abre la carpeta en VS Code.
3. Abre `index.html` con Live Server.
4. Inicia sesión con un usuario de Directus con permisos sobre:
   - `contratos`
   - `obligaciones`
   - `informes_mensuales`

## Nota

La tabla `informes_mensuales` se asocia al contrato mediante `contrato_id`. Las obligaciones se cargan como referencia del contrato. Para asociar actividades a obligaciones específicas, el siguiente módulo recomendado es `Actividades`, usando `informe_id` y `obligacion_id`.
