// src/utils/vibrate.ts
// ─────────────────────────────────────────────
// Feedback tátil no mobile via navigator.vibrate
// ─────────────────────────────────────────────

export const vibrate = {
  // 1. Boia afunda / Alerta de mordida
  bite: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([90, 45, 140]);
      } catch (_) {}
    }
  },

  // 2. Acerto na zona perfeita (Quick-Time / Sweet spot)
  perfectHit: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([40, 30, 80]);
      } catch (_) {}
    }
  },

  // 3. Recolher peixe comum/incomum
  catchNormal: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([70]);
      } catch (_) {}
    }
  },

  // 4. Captura rara / épica
  catchRare: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([100, 50, 160]);
      } catch (_) {}
    }
  },

  // 5. Captura Lendária (Tremor pesado)
  catchLegendary: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([120, 60, 200, 60, 350]);
      } catch (_) {}
    }
  },

  // 6. Moedas / Venda / Loja
  coins: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([35]);
      } catch (_) {}
    }
  },

  // 7. Impacto Pesado / Ascensão
  heavy: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([100, 50, 200]);
      } catch (_) {}
    }
  },

  // 8. Tensão crítica na linha (pulsos curtos de aviso)
  lineStrain: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch (_) {}
    }
  },

  // 9. Ruptura de linha (estalo duplo pesado)
  lineSnap: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([150, 80, 250]);
      } catch (_) {}
    }
  },

  // 10. Puxão ou arrancada do peixe
  fishThrash: () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([70, 40, 90]);
      } catch (_) {}
    }
  },
};
