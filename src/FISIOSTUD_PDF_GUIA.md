# 📚 Guía de FisioStudy - Lectura de PDFs

## ¿Por qué mi PDF no se puede leer?

FisioStudy utiliza la tecnología PDF.js para extraer texto de archivos PDF. Sin embargo, existen algunas limitaciones importantes que debes conocer:

### ✅ PDFs que SÍ funcionan

1. **PDFs nativos o digitales**: Documentos creados directamente desde Word, Google Docs, LaTeX, etc.
2. **PDFs con texto seleccionable**: Si puedes seleccionar y copiar el texto del PDF con tu lector, FisioStudy podrá extraerlo.
3. **Presentaciones exportadas como PDF**: PowerPoint, Keynote, Google Slides exportados directamente.
4. **Libros electrónicos con texto**: eBooks en formato PDF con texto real.

### ❌ PDFs que NO funcionan bien

1. **PDFs escaneados**: Documentos que son fotografías o escaneos de páginas físicas
   - Solución: Usar software OCR (Reconocimiento Óptico de Caracteres) antes de subir
   
2. **PDFs de solo imágenes**: PDFs que contienen únicamente imágenes sin capa de texto
   - Identificación: Si no puedes seleccionar texto en el PDF, probablemente sea una imagen
   
3. **PDFs protegidos o encriptados**: Algunos PDFs tienen restricciones de copia
   - Solución: Contactar al autor para obtener una versión sin restricciones

### 🔍 Cómo saber si tu PDF tiene texto extraíble

**Prueba simple:**
1. Abre el PDF en tu lector habitual (Adobe, Preview, Chrome)
2. Intenta seleccionar algún texto con el cursor
3. Si puedes seleccionar y copiar texto → ✅ FisioStudy podrá leerlo
4. Si al intentar seleccionar no pasa nada o solo seleccionas imágenes → ❌ Es un PDF escaneado

## 💡 Soluciones alternativas

### Si tu PDF no es legible:

#### Opción 1: Copiar y pegar manualmente
```
1. Abre el PDF
2. Selecciona todo el texto (Ctrl+A / Cmd+A)
3. Copia (Ctrl+C / Cmd+C)
4. Pega en el área de texto de FisioStudy
```

#### Opción 2: Usar herramientas OCR
Si tu PDF es un escaneo, usa estas herramientas gratuitas:
- **Google Drive**: Sube el PDF y ábrelo con Google Docs (convierte automáticamente)
- **Adobe Acrobat Online**: Tiene OCR integrado
- **OnlineOCR.net**: Servicio web gratuito
- **Tesseract**: Software OCR de código abierto

#### Opción 3: Convertir a texto plano
1. Usa un conversor online (PDF to TXT)
2. Guarda el resultado como archivo .txt
3. Sube el archivo .txt a FisioStudy

#### Opción 4: Tomar capturas y usar imágenes
- FisioStudy acepta imágenes (JPG, PNG)
- Toma capturas de pantalla de las páginas del PDF
- Sube las imágenes (nota: la IA no puede leer texto en imágenes sin OpenAI configurado)

## 🔧 Problemas técnicos comunes

### "Error al extraer texto del PDF"

**Causas posibles:**
1. El PDF está corrupto o dañado
2. El archivo es demasiado grande (>10MB)
3. Formato PDF poco común o antiguo
4. El navegador no soporta PDF.js correctamente

**Soluciones:**
1. Intenta abrir el PDF en otro lector para verificar que funciona
2. Si el archivo es grande, divide el PDF en partes más pequeñas
3. Exporta/guarda el PDF nuevamente desde otro programa
4. Usa otro navegador (Chrome, Firefox, Safari actualizados)

### El PDF se carga pero el contenido está vacío o mezclado

**Causa:** El PDF tiene un formato de texto complejo o columnas múltiples

**Solución:** Copia el contenido manualmente o reorganiza el texto antes de subirlo

### Mensajes en la consola

Si ves errores en la consola del navegador (F12), envía esta información:
- Nombre del archivo PDF
- Tamaño del archivo
- Mensaje de error específico

## 📋 Formatos de archivo alternativos

FisioStudy también acepta:

### ✅ Archivos de texto plano (.txt)
- Funcionan perfectamente siempre
- No tienen limitaciones de formato
- Recomendado si tienes problemas con PDFs

### ✅ Imágenes (JPG, PNG)
- Útil para diagramas, gráficos, esquemas
- Nota: El texto en imágenes no es extraíble automáticamente
- Puedes describir el contenido manualmente en el área de texto

## 🎯 Mejores prácticas

1. **Verifica antes de subir**: Prueba si puedes seleccionar texto en tu PDF
2. **Divide contenido largo**: Archivos más pequeños son más fáciles de procesar
3. **Usa texto plano cuando sea posible**: Es más fiable que PDF
4. **Combina formatos**: Texto manual + imágenes para diagramas funciona muy bien
5. **Revisa el resultado**: Después de cargar, verifica que el contenido se extrajo correctamente

## ⚙️ Información técnica

FisioStudy utiliza:
- **PDF.js v3.11.174**: Librería de Mozilla para lectura de PDFs
- **Web Workers**: Para procesamiento asíncrono sin bloquear la interfaz
- **TextContent API**: Para extracción precisa de texto

El proceso de extracción:
1. El PDF se carga en memoria como ArrayBuffer
2. PDF.js parsea la estructura del documento
3. Se extrae el texto página por página
4. Se combina todo el texto extraído
5. Si no hay texto, se notifica al usuario

## 🆘 ¿Sigue sin funcionar?

Si después de seguir esta guía tu PDF no funciona:

1. **Verifica el tamaño**: Máximo 10MB por archivo
2. **Prueba con otro PDF**: Para descartar problemas del navegador
3. **Usa la alternativa manual**: Copia y pega siempre funciona
4. **Revisa la consola del navegador**: Los logs dan información útil

Recuerda: **Copiar y pegar el texto manualmente siempre es la opción más fiable** si tienes problemas con la carga automática de PDFs.
