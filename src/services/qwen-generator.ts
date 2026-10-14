// GAGO OPEN ARTIFACT FACTORY - Qwen Coder Order Generator
import type { QwenOrder, Project } from '../types';

export function generateQwenOrder(order: QwenOrder, project?: Project): string {
  const projectName = project?.name || 'Proyecto no especificado';
  const timestamp = new Date(order.generatedAt).toLocaleString('es-ES');

  let doc = `# ORDEN DE DESARROLLO PARA QWEN CODER
## Generada por GAGO Open Artifact Factory
**Fecha:** ${timestamp}
**Proyecto:** ${projectName}
**Estado:** Preparada localmente — No ejecutada

---

## Objetivo
${order.objective}

## Requisitos
${order.requirements.length > 0 ? order.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n') : '- Sin requisitos específicos definidos'}

## Restricciones
${order.constraints.length > 0 ? order.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n') : '- Sin restricciones específicas definidas'}

## Criterios de aceptación
${order.acceptanceCriteria.length > 0 ? order.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : '- Sin criterios de aceptación definidos'}

---

## Notas
- Esta orden ha sido generada localmente mediante plantillas de GAGO Factory.
- No ha sido ejecutada por Qwen Coder.
- El proveedor de IA no está conectado en la Fase Cero.
- Copie este documento y utilícelo como instrucción para Qwen Coder.
`;

  return doc;
}

export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
