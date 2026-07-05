# AppWeb Directus Pro - Contratos, Informes, Actividades e Imágenes

Aplicación web responsive conectada a Directus en:

`http://100.105.113.77:8055`

## Funcionalidades

- Inicio de sesión con usuario y contraseña de Directus.
- Prueba de conexión API.
- Crear, editar, actualizar y eliminar contratos.
- Crear, editar, actualizar y eliminar obligaciones por contrato.
- Crear, editar, actualizar y eliminar informes mensuales por contrato.
- Abrir un informe mensual y agregar actividades por cada obligación.
- Crear, editar y eliminar actividades.
- Subir imágenes/archivos por actividad.
- Pegar capturas de pantalla con Ctrl + V.
- Clasificar archivos como: encabezado, cuerpo, anexo o soporte.
- Guardar descripción y orden de cada imagen.

## Uso

1. Descomprime el ZIP.
2. Abre la carpeta completa en VS Code.
3. Clic derecho sobre `index.html` → `Open with Live Server`.
4. Ingresa con tu usuario y contraseña de Directus.

## Requisitos en Directus

El usuario debe tener permisos para estas colecciones:

- `contratos`: read, create, update, delete.
- `obligaciones`: read, create, update, delete.
- `informes_mensuales`: read, create, update, delete.
- `actividades`: read, create, update, delete.
- `archivos_actividad`: read, create, update, delete.
- `directus_files`: read, create, delete.

Además, Directus debe tener CORS habilitado para la URL de Live Server.

## Campos esperados en `archivos_actividad`

- `id`
- `actividad_id`
- `nombre_original`
- `nombre_archivo`
- `ruta`
- `tipo_mime`
- `created_at`
- `categoria`
- `descripcion`
- `orden`
- `directus_file_id`

## Almacenamiento

Los archivos se suben a Directus usando `/files`. Directus los guarda en la carpeta persistente configurada en CasaOS, por ejemplo:

`/media/casa/Datawil/AppData/directus/uploads`

La tabla `archivos_actividad` guarda la referencia del archivo en `directus_file_id` y su clasificación para futuros documentos PDF/ayudamemoria.
