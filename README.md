# AppWeb Directus Pro - Exportaciones con imágenes embebidas

Versión ajustada para que las imágenes cargadas en actividades se usen de forma autenticada desde Directus y se incrusten como `data:image/...` dentro de la vista de ayudamemoria y del archivo Word.

## Corrección incluida

- Las miniaturas de imágenes en la interfaz ya no dependen de un `<img src="/assets/...">` sin autorización.
- El botón **Ver** abre la imagen usando el token de sesión de la AppWeb.
- La **Ayudamemoria** convierte las imágenes de encabezado y cuerpo a Base64 antes de generar el documento.
- El archivo Word descargado incluye las imágenes embebidas, no solo enlaces externos.

## Uso

1. Abrir `index.html` con Live Server.
2. Iniciar sesión con el usuario de Directus.
3. Abrir Contratos → Informes → Abrir informe → Actividades.
4. En una actividad, subir imágenes y clasificarlas como `encabezado` o `cuerpo`.
5. Generar Ayudamemoria y descargar Word o imprimir como PDF.

## URL Directus configurada

`http://100.105.113.77:8055`
