// src/utils/vibrate.ts
// ─────────────────────────────────────────────
// Feedback tátil no mobile via navigator.vibrate
// ─────────────────────────────────────────────

let vibrationEnabled = true;
try {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pescaria_vibration_enabled');
    if (saved !== null) vibrationEnabled = saved === 'true';
  }
} catch (_) {}

export const vibrate = {
  get enabled(): boolean {
    return vibrationEnabled;
  },
  set enabled(val: boolean) {
    vibrationEnabled = val;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pescaria_vibration_enabled', String(val));
      }
    } catch (_) {}
  },
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  // 1. Boia afunda / Alerta de mordida
  bite: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([90, 45, 140]);
      } catch (_) {}
    }
  },

  // 2. Acerto na zona perfeita (Quick-Time / Sweet spot)
  perfectHit: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([40, 30, 80]);
      } catch (_) {}
    }
  },

  // 3. Recolher peixe comum/incomum
  catchNormal: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([70]);
      } catch (_) {}
    }
  },

  // 4. Captura rara / épica
  catchRare: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([100, 50, 160]);
      } catch (_) {}
    }
  },

  // 5. Captura Lendária (Tremor pesado)
  catchLegendary: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([120, 60, 200, 60, 350]);
      } catch (_) {}
    }
  },

  // 6. Moedas / Venda / Loja
  coins: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([35]);
      } catch (_) {}
    }
  },

  // 7. Impacto Pesado / Ascensão
  heavy: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([100, 50, 200]);
      } catch (_) {}
    }
  },

  // 8. Tensão crítica na linha (pulsos curtos de aviso)
  lineStrain: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch (_) {}
    }
  },

  // 9. Ruptura de linha (estalo duplo pesado)
  lineSnap: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([150, 80, 250]);
      } catch (_) {}
    }
  },

  // 10. Puxão ou arrancada do peixe
  fishThrash: () => {
    if (!vibrationEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([70, 40, 90]);
      } catch (_) {}
    }
  },
};
