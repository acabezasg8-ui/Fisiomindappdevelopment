# Configuración de Supabase para FisioMind

¡FisioMind ahora está conectado a Supabase! Esto te permite tener persistencia en la nube y funcionalidades avanzadas de IA.

## ✅ ¿Qué ya está configurado?

- **Autenticación con Supabase Auth**: Los usuarios pueden registrarse e iniciar sesión
- **Persistencia de datos**: Casos clínicos y de examen se guardan en la base de datos
- **Servidor backend**: Todas las rutas API están configuradas
- **Cliente frontend**: La aplicación está conectada al backend

## 🔑 Configuración de OpenAI (Opcional pero Recomendado)

Para activar las funcionalidades de IA avanzada (paciente virtual inteligente, tutor socrático, evaluaciones automáticas):

### 1. Obtener tu API Key de OpenAI

1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Click en "Create new secret key"
4. Copia la clave API (comienza con `sk-...`)

### 2. Configurar la API Key en Supabase

**Opción A: Desde el editor de código (si tienes acceso)**
1. Abre la terminal de tu proyecto Supabase
2. Ejecuta: `supabase secrets set OPENAI_API_KEY=tu-api-key-aquí`

**Opción B: Desde el Dashboard de Supabase**
1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Ve a Settings → Edge Functions → Environment Variables
3. Agrega una nueva variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Tu clave API de OpenAI
4. Guarda los cambios

### 3. Verificar la configuración

Una vez configurada, la aplicación automáticamente:
- ✅ Usará OpenAI para generar respuestas del paciente virtual
- ✅ Usará el tutor socrático IA en modo examen
- ✅ Generará evaluaciones detalladas automáticas
- ✅ Creará casos de examen variados con IA

Si OpenAI no está configurado, la aplicación funcionará con respuestas locales básicas.

## 🔄 Funcionalidades con/sin OpenAI

| Funcionalidad | Sin OpenAI | Con OpenAI |
|---------------|------------|------------|
| Autenticación | ✅ Completa | ✅ Completa |
| Guardar casos | ✅ Completa | ✅ Completa |
| Casos predefinidos | ✅ 4 casos | ✅ Casos ilimitados generados por IA |
| Paciente virtual | ⚠️ Respuestas básicas | ✅ Conversación inteligente y contextual |
| Tutor examen | ⚠️ Respuestas genéricas | ✅ Método socrático pedagógico |
| Evaluaciones | ⚠️ Basadas en métricas simples | ✅ Análisis detallado por IA |
| FisioStudy | ⚠️ Respuestas genéricas | ✅ Explicaciones personalizadas |

## 📊 Estado actual del proyecto

- ✅ Backend Supabase: Funcionando
- ✅ Autenticación: Funcionando
- ✅ Base de datos KV: Funcionando
- ✅ Frontend conectado: Funcionando
- ⚙️ OpenAI: Esperando configuración (opcional)

## 🔒 Seguridad y Buenas Prácticas

- ✅ La API Key de OpenAI se almacena de forma segura en el servidor
- ✅ Nunca se expone al frontend
- ✅ Los datos de usuarios están aislados por userId
- ✅ Las contraseñas se manejan con Supabase Auth (encriptadas)

## 🚀 Próximos pasos

1. **Prueba la aplicación**: Crea una cuenta y prueba todas las funcionalidades
2. **(Opcional) Configura OpenAI**: Sigue los pasos anteriores para activar IA avanzada
3. **Invita a usuarios**: Comparte la aplicación con otros estudiantes de fisioterapia

## ❓ Preguntas Frecuentes

**Q: ¿Cuánto cuesta usar OpenAI?**  
A: OpenAI cobra por uso. Con el modelo `gpt-4o-mini` que usa FisioMind, el costo es muy bajo (~$0.15 por 1M de tokens de entrada, ~$0.60 por 1M de salida). Para uso educativo típico, esto significa unos pocos centavos por día.

**Q: ¿Qué pasa si no configuro OpenAI?**  
A: La aplicación funcionará perfectamente pero con respuestas predefinidas en lugar de respuestas generadas por IA. Todas las demás funcionalidades (casos, evaluaciones, guardado) funcionan igual.

**Q: ¿Mis datos están seguros?**  
A: Sí, todos los datos se almacenan en tu instancia privada de Supabase. Cada usuario solo puede ver sus propios casos. Las comunicaciones usan HTTPS y autenticación por tokens.

**Q: ¿Puedo cambiar la API Key después?**  
A: Sí, simplemente sigue los pasos de configuración nuevamente con la nueva clave.

## 📝 Notas técnicas

- **Modelo IA**: gpt-4o-mini (rápido y económico)
- **Base de datos**: Supabase KV Store (key-value)
- **Autenticación**: Supabase Auth con email/contraseña
- **Backend**: Deno Edge Functions con Hono framework
- **Frontend**: React + TypeScript + Tailwind CSS

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo o consulta la documentación de Supabase en [supabase.com/docs](https://supabase.com/docs)
