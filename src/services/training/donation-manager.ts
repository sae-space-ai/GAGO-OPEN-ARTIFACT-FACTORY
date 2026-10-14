// GAGO Open Artifact Factory - Donation Support Manager
// Phase 9: JOULE FREE TRAINING CENTER

import type { Donation, DonationTransparency } from '../../types/training';
import { generateId } from '../storage';

/**
 * Estado del sistema de donaciones
 */
export interface DonationSystemState {
  enabled: boolean;
  provider?: string;
  providerConfigured: boolean;
  donations: Donation[];
  transparency: DonationTransparency;
}

/**
 * Estado inicial del sistema de donaciones (deshabilitado)
 */
export function getInitialDonationState(): DonationSystemState {
  return {
    enabled: false,
    providerConfigured: false,
    donations: [],
    transparency: {
      totalDonations: 0,
      totalDonors: 0,
      operationalCosts: 0,
      freeCapacityOffered: 0,
      freeCapacityUsed: 0,
      sustainabilityGoals: [
        'Mantener el servicio gratuito de entrenamiento local',
        'Ampliar la capacidad de entrenamiento compartido cuando sea posible',
        'Cubrir costes de infraestructura y mantenimiento'
      ],
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Verifica si el sistema de donaciones está disponible
 */
export function isDonationSystemAvailable(state: DonationSystemState): boolean {
  return state.enabled && state.providerConfigured;
}

/**
 * Crea una nueva donación pendiente
 */
export function createPendingDonation(
  userId: string,
  amount: number,
  currency: string,
  provider: string
): Donation {
  return {
    id: generateId(),
    userId,
    amount,
    currency,
    provider,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * Confirma una donación después de verificación del proveedor
 */
export function confirmDonation(
  donation: Donation,
  transactionId: string
): Donation {
  return {
    ...donation,
    status: 'completed',
    transactionId,
    completedAt: new Date().toISOString()
  };
}

/**
 * Marca una donación como fallida
 */
export function markDonationAsFailed(donation: Donation, reason?: string): Donation {
  return {
    ...donation,
    status: 'failed',
    completedAt: new Date().toISOString()
  };
}

/**
 * Actualiza la transparencia con una nueva donación
 */
export function updateTransparencyWithDonation(
  transparency: DonationTransparency,
  donation: Donation
): DonationTransparency {
  if (donation.status !== 'completed') {
    return transparency;
  }

  const uniqueDonors = new Set([
    ...Array(transparency.totalDonors).keys(),
    donation.userId
  ]).size;

  return {
    ...transparency,
    totalDonations: transparency.totalDonations + donation.amount,
    totalDonors: uniqueDonors,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calcula estadísticas de donaciones
 */
export function getDonationStatistics(donations: Donation[]): {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
  averageAmount: number;
  uniqueDonors: number;
} {
  const completed = donations.filter(d => d.status === 'completed');
  const pending = donations.filter(d => d.status === 'pending');
  const failed = donations.filter(d => d.status === 'failed');
  
  const totalAmount = completed.reduce((sum, d) => sum + d.amount, 0);
  const uniqueDonors = new Set(completed.map(d => d.userId)).size;

  return {
    total: donations.length,
    completed: completed.length,
    pending: pending.length,
    failed: failed.length,
    totalAmount,
    averageAmount: completed.length > 0 ? totalAmount / completed.length : 0,
    uniqueDonors
  };
}

/**
 * Valida un importe de donación
 */
export function validateDonationAmount(
  amount: number,
  currency: string,
  minAmount: number = 1,
  maxAmount: number = 10000
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'El importe debe ser mayor que cero' };
  }

  if (amount < minAmount) {
    return { valid: false, error: `El importe mínimo es ${minAmount} ${currency}` };
  }

  if (amount > maxAmount) {
    return { valid: false, error: `El importe máximo es ${maxAmount} ${currency}` };
  }

  return { valid: true };
}

/**
 * Genera un mensaje de agradecimiento para donaciones
 */
export function generateThankYouMessage(donation: Donation): string {
  const messages = [
    `Gracias por tu donación de ${donation.amount} ${donation.currency}. Tu contribución ayuda a mantener el servicio gratuito.`,
    `Tu generosidad de ${donation.amount} ${donation.currency} permite que más personas accedan al entrenamiento gratuito.`,
    `Gracias por apoyar el proyecto con ${donation.amount} ${donation.currency}. Juntos construimos una plataforma más sostenible.`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Importantes notas legales y de cumplimiento
 */
export const DONATION_NOTICES = {
  voluntary: 'Las donaciones son completamente voluntarias y no son obligatorias para utilizar el servicio gratuito.',
  noGuarantees: 'Las donaciones no garantizan acceso a capacidades adicionales o servicio prioritario.',
  noTaxAdvice: 'Este sistema no proporciona asesoramiento fiscal. Consulta con un profesional para deducciones fiscales.',
  noRefunds: 'Las donaciones no son reembolsables una vez procesadas.',
  transparency: 'Los fondos recibidos se utilizan para mantener y mejorar la infraestructura gratuita.',
  privacy: 'La información de los donantes se trata con confidencialidad y no se comparte con terceros.'
};

/**
 * Proveedores de pago soportados (preparados para futura integración)
 */
export const SUPPORTED_PAYMENT_PROVIDERS = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Procesador de pagos global',
    supported: false, // Pendiente de configuración
    currencies: ['EUR', 'USD', 'GBP']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Plataforma de pagos online',
    supported: false, // Pendiente de configuración
    currencies: ['EUR', 'USD', 'GBP', 'CAD']
  },
  {
    id: 'github-sponsors',
    name: 'GitHub Sponsors',
    description: 'Patrocinios a través de GitHub',
    supported: false, // Pendiente de configuración
    currencies: ['USD']
  },
  {
    id: 'open-collective',
    name: 'Open Collective',
    description: 'Plataforma de financiación colectiva para proyectos abiertos',
    supported: false, // Pendiente de configuración
    currencies: ['EUR', 'USD', 'GBP']
  }
];

/**
 * Verifica si un proveedor de pago está configurado
 */
export function isPaymentProviderConfigured(providerId: string): boolean {
  const provider = SUPPORTED_PAYMENT_PROVIDERS.find(p => p.id === providerId);
  return provider?.supported || false;
}
