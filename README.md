# AppWeb Gestión de Informes conectada a Directus

Esta AppWeb se conecta a Directus y administra estas colecciones:

- `contratos`
- `obligaciones`
- `informes_mensuales`
- `actividades`

## Requisitos

- Directus funcionando en CasaOS.
- URL usada por defecto: `http://100.105.113.77:8055`.
- Usuario de Directus con permisos para leer y crear registros.

## Cómo abrir

Opción recomendada:

1. Abre esta carpeta en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho sobre `index.html`.
4. Selecciona **Open with Live Server**.

También puedes abrir `index.html` directamente en el navegador, pero Live Server suele funcionar mejor.

## Permisos en Directus

Si la app abre pero no carga datos, revisa en Directus:

```text
Settings → Access Policies / User Roles
```

El usuario debe tener permisos para:

```text
contratos: read, create, update
obligaciones: read, create
informes_mensuales: read, create
actividades: read, create
```

## Flujo de uso

1. Iniciar sesión con el usuario de Directus.
2. Crear contrato.
3. Crear obligaciones asociadas al contrato.
4. Crear informe mensual asociado al contrato.
5. Crear actividades asociadas al informe mensual y, opcionalmente, a una obligación.

## Nota

Esta es una versión inicial funcional. Luego se puede mejorar con eliminación, edición completa de obligaciones/informes/actividades, carga de archivos y diseño institucional.
