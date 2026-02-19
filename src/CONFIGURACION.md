# Configuración de FisioMind

## Funcionalidades Backend Implementadas

FisioMind incluye integración completa con Supabase y un sistema de IA pedagógica avanzada:

### ✅ Sistema de Autenticación
- **Registro de estudiantes**: Cada estudiante crea su cuenta personal
- **Inicio de sesión seguro**: Autenticación con email y contraseña
- **Datos personalizados**: Todos los casos y progreso están vinculados a tu cuenta
- **Gestión de sesiones**: Mantiene tu sesión activa entre visitas

### ✅ Persistencia de Datos
- Los casos completados se guardan automáticamente en tu cuenta de Supabase
- El historial de chat y las notas se preservan entre sesiones
- Las evaluaciones quedan registradas para seguimiento de tu progreso personal
- Cada estudiante tiene su propio espacio de datos aislado

### ✅ DOS MODOS DE PRÁCTICA

#### 1️⃣ **Simulación Libre** (Modo Interactivo)
- Interactúa con un paciente virtual
- Realiza anamnesis, exploración y tratamiento
- Toma notas durante la sesión
- Evaluación completa al finalizar

#### 2️⃣ **Modo Examen** (Preparación para Exámenes) ⭐ NUEVO
- **Casos generados por IA**: Formato profesional de examen universitario
- **Casos del profesor**: Sube tus propios enunciados de examen
- **Tutor IA pedagógico**: Te guía mediante método socrático sin dar respuestas directas
- **Solicita pistas**: Ayuda cuando te atascas
- **Objetivo**: Aprender razonamiento clínico y aprobar exámenes

### ✅ Generación de Casos
- **Simulación**: Casos clínicos interactivos variados
- **Examen**: Casos en formato académico con datos completos (paciente, antecedentes, exploración, objetivos)
- Amplia variedad de patologías de fisioterapia (cervicalgia, lumbalgia, tendinopatías, artrosis, etc.)

### ✅ Sistema de IA Pedagógica
- **Modo Básico**: Respuestas contextuales inteligentes con feedback pedagógico (activo por defecto)
- **Modo Avanzado con OpenAI**: 
  - Paciente virtual más realista (simulación)
  - Tutor socrático inteligente (modo examen)
  - Generación automática de casos de examen realistas
  - Evaluación automática personalizada

### ✅ Evaluación Inteligente
- **Con OpenAI**: Evaluación automática personalizada analizando conversación y notas clínicas
- **Sin OpenAI**: Sistema de evaluación local basado en keywords y heurísticas

## Configuración de OpenAI (Opcional)

Para habilitar respuestas de IA más naturales y contextuales del paciente virtual, puedes configurar OpenAI:

### Paso 1: Obtener API Key de OpenAI

1. Visita [OpenAI Platform](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a [API Keys](https://platform.openai.com/api-keys)
4. Crea una nueva API key
5. Copia la clave (la necesitarás en el siguiente paso)

### Paso 2: Configurar en Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard/project/udocokjijlkqnmzzszxj)
2. En el menú lateral, selecciona **Edge Functions**
3. Haz clic en **Environment Variables**
4. Añade una nueva variable:
   - **Nombre**: `OPENAI_API_KEY`
   - **Valor**: Tu API key de OpenAI
5. Guarda los cambios
6. Recarga la aplicación FisioMind

### Paso 3: Verificar Configuración

1. En FisioMind, haz clic en el botón de configuración (⚙️) en la esquina superior derecha
2. Verifica que aparezca la insignia "Activo" en "Integración con IA Avanzada"
3. ¡Listo! Ahora las respuestas del paciente serán más naturales y contextuales

## Diferencias entre Modos

### Modo Básico (Sin OpenAI)
- ✅ Sin costos adicionales
- ✅ Respuestas instantáneas
- ✅ Funciona sin configuración
- ✅ Respuestas específicas por patología con detalles clínicos
- ✅ Feedback pedagógico automático (recuerda hacer exploración física, preguntar factores agravantes, etc.)
- ✅ Respuestas coherentes a exploración física según patología
- ⚠️ Evaluación basada en keywords
- ⚠️ Menos variabilidad en las conversaciones

### Modo Avanzado (Con OpenAI)
- ✅ **Simulación**: Paciente virtual extremadamente realista y coherente
- ✅ **Modo Examen**: Tutor IA que usa método socrático (pregunta en vez de decir)
- ✅ Generación automática de casos de examen profesionales
- ✅ Comprensión profunda del contexto clínico completo
- ✅ Evaluación automática PERSONALIZADA analizando toda la conversación
- ✅ Feedback educativo detallado explicando el PORQUÉ de cada puntuación
- ✅ Guía pedagógica adaptada al nivel del estudiante
- ⚠️ Requiere API key de OpenAI (costo mínimo por uso)
- ⚠️ Respuestas ligeramente más lentas (1-2 segundos)

## Mejoras del Sistema de IA

### 🎓 Modo Simulación: Paciente Virtual con Doble Rol
El paciente virtual tiene un **doble rol**:
1. **Paciente Realista**: Responde de forma natural y coherente con su patología
2. **Tutor Pedagógico**: Guía sutilmente al estudiante hacia el razonamiento clínico correcto

**Feedback Pedagógico Automático:**
- Si el estudiante olvida hacer exploración física → "¿No va a examinarme?"
- Si no preguntan sobre características del dolor → Ofrece información espontáneamente
- Si se olvidan de aspectos cruciales → Da pistas sutiles
- Si hacen preguntas irrelevantes → Redirige educadamente

### 🎯 Modo Examen: Tutor Socrático (NUEVO)
El tutor IA del modo examen utiliza **método socrático**:

**¿Qué es el Método Socrático?**
En lugar de dar respuestas, el tutor te hace **preguntas** que te llevan a descubrir la solución por ti mismo.

**Ejemplo:**
- ❌ Tutor tradicional: "El diagnóstico es tendinopatía del supraespinoso"
- ✅ Tutor socrático: "Considerando la edad del paciente, el arco doloroso y el test de Neer positivo, ¿qué estructura del hombro crees que está afectada?"

**Funcionalidades:**
- 💬 **Chat con el tutor**: Pregunta dudas, pide explicaciones, comparte tu análisis
- 💡 **Solicitar pistas**: Botón para recibir orientación cuando te atascas
- 📝 **Redactar respuesta**: Espacio para escribir tu análisis completo del caso
- 🎓 **Aprende el PORQUÉ**: No solo la respuesta, sino el razonamiento detrás

**Tipos de ayuda:**
1. **Pistas sobre análisis**: "Identifica primero los datos clave del paciente"
2. **Pistas sobre exploración**: "¿Qué tests específicos harías según la zona?"
3. **Pistas sobre diagnóstico**: "Haz un diagnóstico diferencial con 2-3 opciones"
4. **Pistas sobre tratamiento**: "Piensa en objetivos SMART para cada fase"

### 📊 Evaluación Inteligente (Con OpenAI)
La evaluación con IA analiza:
- ✅ Calidad de las preguntas de anamnesis
- ✅ Completitud de la exploración física
- ✅ Uso de las notas clínicas para razonamiento
- ✅ Coherencia del plan de tratamiento con el diagnóstico
- ✅ Calidad de la comunicación y educación al paciente
- ✅ Proporciona feedback **constructivo y específico** para mejorar

## Cómo Usar el Modo Examen

### Opción 1: Casos Generados por IA
1. Clic en "Modo Examen" desde la pantalla principal
2. Selecciona "Casos Generados por IA"
3. La IA creará un caso realista en formato examen
4. Lee el enunciado cuidadosamente
5. Chatea con el tutor para discutir tu análisis
6. Solicita pistas cuando lo necesites
7. Escribe tu respuesta completa
8. Finaliza para revisar

### Opción 2: Caso del Profesor (Preparación Específica)
1. Clic en "Modo Examen"
2. Selecciona "Caso del Profesor"
3. Copia y pega el enunciado del caso de tu examen
4. El tutor IA te ayudará a resolverlo paso a paso
5. Practica el mismo caso cuantas veces quieras
6. Perfecto para preparar exámenes específicos

**💡 Consejo**: Usa el Modo Examen para:
- Prepararte para exámenes reales
- Practicar diagnóstico diferencial
- Aprender razonamiento clínico estructurado
- Entender el PORQUÉ de cada decisión clínica

## Costos de OpenAI

El uso de OpenAI GPT-4o-mini tiene un costo muy bajo:
- Aproximadamente $0.15 por millón de tokens de entrada
- Aproximadamente $0.60 por millón de tokens de salida
- Una conversación típica: ~2000-3000 tokens totales
- Evaluación de un caso: ~1500 tokens
- Costo estimado: **$0.002-$0.003 por caso completo** (conversación + evaluación)
- Con $5 USD podrías realizar **más de 1500 simulaciones completas**

## Primeros Pasos

### 1. Crear tu Cuenta
1. Abre FisioMind en tu navegador
2. En la pantalla de bienvenida, haz clic en **"Registrarse"**
3. Completa el formulario:
   - **Nombre completo**: Tu nombre como estudiante
   - **Email**: Tu email personal o universitario
   - **Contraseña**: Mínimo 6 caracteres
4. Haz clic en **"Crear Cuenta"**
5. ¡Listo! Tu cuenta se creará automáticamente y podrás comenzar a practicar

### 2. Iniciar Sesión
Si ya tienes cuenta:
1. En la pantalla de bienvenida, asegúrate de estar en **"Iniciar Sesión"**
2. Ingresa tu email y contraseña
3. Haz clic en **"Iniciar Sesión"**
4. Accederás a tu panel personalizado con todo tu historial

### 3. Cerrar Sesión
- Haz clic en el botón **"Cerrar Sesión"** en la esquina superior derecha
- Tus datos permanecerán guardados y estarán disponibles cuando vuelvas a iniciar sesión

## Seguridad y Privacidad

- ✅ **Autenticación segura**: Contraseñas encriptadas con Supabase Auth
- ✅ **Datos personalizados**: Cada estudiante solo ve sus propios casos y progreso
- ✅ **Sesiones protegidas**: Sistema de tokens de acceso para mantener tu sesión segura
- ✅ La API key de OpenAI se almacena de forma segura como variable de entorno en Supabase
- ✅ Nunca se expone información sensible al frontend
- ✅ Todas las solicitudes pasan por tu servidor Edge Function
- ✅ Los datos de los pacientes virtuales son ficticios para proteger tu privacidad

## Soporte

Si tienes problemas con la configuración:
1. Verifica que la API key sea correcta
2. Asegúrate de tener créditos disponibles en OpenAI
3. Revisa los logs en Supabase Dashboard > Edge Functions > Logs
4. La aplicación funciona perfectamente sin OpenAI en modo básico

---

**Nota**: Esta aplicación es solo para fines educativos. No utilices información de pacientes reales.
