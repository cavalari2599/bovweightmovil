# Limitaciones conocidas — BovWeight CR

## La estimación de peso no considera la raza del animal

El microservicio de estimación (CNN sobre la fotografía lateral del animal) calcula
el peso **a partir de la silueta/volumen visible en la imagen**. **No usa la raza**
como variable de entrada.

### Implicación

Dos animales de **razas distintas** (por ejemplo Brahman vs. Holstein) con una
**silueta similar** en la foto recibirán una estimación de peso parecida, aunque su
peso real pueda diferir por densidad/conformación propia de cada raza.

### Por qué

- El modelo preentrenado disponible estima a partir de la geometría del animal en la
  imagen, no de su genética.
- No se dispone de un dataset etiquetado por raza suficiente para ajustar el modelo
  por raza en el alcance de este proyecto.

### Mitigaciones implementadas

- La **raza sí se registra** por animal (campo `raza`) para trazabilidad y reportes,
  aunque no alimente el modelo.
- En cada estimación se muestra un **aviso en la interfaz** indicando que el valor es
  aproximado y que **no distingue la raza** (pantallas de Captura Rápida del ganadero
  y del ayudante).
- El usuario puede **corregir manualmente** el peso estimado antes de guardarlo.
- El sistema deja claro que la estimación es **de apoyo** y **no sustituye una báscula
  oficial** para transacciones formales.

### Trabajo futuro (fuera de alcance)

Reentrenar/ajustar el modelo con un dataset etiquetado por raza, o aplicar un factor
de corrección por raza sobre la estimación base.
