# Configuración de Despliegue - FisioMind

## Modo de Funcionamiento

Esta aplicación funciona **completamente del lado del cliente** sin necesidad de servidor backend.

## Supabase

- **Estado**: DESHABILITADO
- **Funciones Edge**: NO DESPLEGAR
- **Autenticación**: Local (localStorage)
- **Base de datos**: Local (localStorage)

## Razón

La aplicación utiliza únicamente localStorage para:
- Almacenamiento de datos de usuario
- Casos clínicos completados
- Sesiones de usuario
- Progreso del estudiante

**IMPORTANTE**: No intentar desplegar funciones de Supabase. Los archivos en `/supabase/functions` son archivos del sistema que no deben ser desplegados.
