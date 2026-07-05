# AppWeb Directus Pro - refinada

Versión refinada para gestión de contratos, obligaciones, informes mensuales, actividades e imágenes.

## Ajustes incluidos

- Numeración automática general de actividades por informe: A1, A2, A3...
- Exportación mensual en CSV y Excel con dos columnas:
  - `ID OBLIGACIÓN`
  - Mes seleccionado en mayúsculas, por ejemplo `JUNIO`
- Las actividades se exportan dentro de la misma celda separadas por saltos de línea.
- Excel en formato `.xls` HTML con texto ajustado dentro de celda.
- Ayudamemoria con formato institucional:
  - Título centrado `AYUDA MEMORIA`
  - Tabla superior de dos columnas: imagen de encabezado y objetivo identificado
  - Datos narrativos debajo: fecha, modalidad, convoca y participantes
  - Desarrollo de la actividad
  - Imágenes de cuerpo a ancho amplio
- Imágenes embebidas en el Word como Base64.

## Uso

Abrir `index.html` con Live Server desde VS Code.

Directus configurado por defecto en:

`http://100.105.113.77:8055`


## Ajuste móvil de informes

En el panel previo de Informes se ocultó la lista de obligaciones del contrato para ahorrar espacio, especialmente en celular. Las obligaciones siguen cargándose y se trabajan al abrir cada informe mensual, donde se agregan las actividades por obligación.
