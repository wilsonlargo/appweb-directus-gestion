# AppWeb Directus Pro - Gestión de Contratos

Aplicación web estática, responsive, conectada a Directus.

## Archivos

- `index.html`
- `styles.css`
- `app.js`

## Uso

1. Descomprimir el ZIP.
2. Abrir la carpeta completa en VS Code.
3. Abrir `index.html` con Live Server.
4. Ingresar con usuario y contraseña de Directus.

## URL configurada

La URL de Directus está en la primera línea de `app.js`:

```js
const DIRECTUS_URL = "http://100.105.113.77:8055";
```

## Funciones incluidas

- Pantalla de inicio con usuario y contraseña.
- Prueba de conexión con la API de Directus.
- Listado responsive de contratos.
- Buscador de contratos.
- Crear contrato nuevo.
- Editar contrato existente.
- Eliminar contrato, si la base lo permite.
- Resumen con indicadores básicos.
- Sesión guardada en `localStorage`.

## Colección usada

La app usa la colección Directus:

- `contratos`

Campos esperados:

- `id`
- `numero_contrato`
- `objeto`
- `entidad`
- `contratista`
- `supervisor`
- `fecha_inicio`
- `fecha_fin`
- `created_at`

## Nota

Para que funcione desde Live Server, Directus debe tener CORS habilitado.
