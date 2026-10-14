# Fases de desarrollo — GAGO Open Artifact Factory

## Fase Cero (actual) — Fundamentos

**Estado:** Implementada

**Objetivo:** Crear la infraestructura técnica base.

**Entregables:**
- Aplicación web funcional con Vite, React y TypeScript
- Gestión de proyectos, tareas, artefactos y evidencias
- Persistencia local con localStorage
- Generador local de órdenes para Qwen Coder
- Importación y exportación de datos
- Configuración de Vercel y GitHub Actions
- Documentación técnica y de arquitectura
- Pruebas automatizadas básicas

**Limitaciones:**
- Sin conexión a APIs externas
- Sin autenticación
- Sin agentes autónomos
- Sin backend

---

## Fase Uno — Integración de IA

**Objetivo:** Conectar modelos de inteligencia artificial mediante un backend seguro.

**Previsto:**
- Backend seguro para proteger credenciales de API
- Primer adaptador para Qwen (API real)
- Ejecución supervisada de órdenes de desarrollo
- Registro de solicitudes, respuestas y consumo
- Primer agente programador supervisado

**Dependencias:**
- Servicio de hosting con capacidad de ejecución (backend)
- Claves API de proveedores de IA
- Sistema de autenticación básico

---

## Fase Dos — Agentes especializados

**Objetivo:** Implementar agentes autónomos supervisados.

**Previsto:**
- Agente de análisis de requisitos
- Agente de arquitectura
- Agente de programación
- Agente de pruebas
- Agente de seguridad
- Agente de documentación
- Sistema de aprobación humana para decisiones críticas
- Trazabilidad completa de acciones de agentes

---

## Fase Tres — JOULE

**Objetivo:** Integrar JOULE como motor de optimización.

**Previsto:**
- Interfaz técnica verificable para JOULE
- Optimización de recursos computacionales
- Coordinación de agentes
- Métricas reales de consumo y eficiencia

**Nota:** JOULE no se integrará hasta disponer de una interfaz técnica verificable. No se le atribuirán capacidades que no estén implementadas y comprobadas.

---

## Fase Cuatro — Escalado

**Objetivo:** Soporte multiusuario y sincronización.

**Previsto:**
- Autenticación y autorización reales
- Base de datos compartida
- Sincronización entre dispositivos
- Roles y permisos
- Auditoría de acciones
