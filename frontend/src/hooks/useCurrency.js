import { useState } from 'react';

// --- Lista de monedas soportadas ---
const CURRENCIES = [
  { code: 'ARS', symbol: '$', label: 'Pesos argentinos' },
  { code: 'USD', symbol: 'US$', label: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'BRL', symbol: 'R$', label: 'Real brasileño' },
];

// --- Hook personalizado para manejar la moneda seleccionada ---
export function useCurrency() {
  // Estado de la moneda actual (se inicializa desde localStorage o por defecto 'ARS')
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'ARS';
  });

  // Cambia la moneda y la guarda en localStorage
  const setAndSaveCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('currency', code);
  };

  // Datos completos de la moneda seleccionada (símbolo, label, etc)
  const currencyData = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // Retorna el estado, setter y la lista de monedas disponibles
  return { currency, setCurrency: setAndSaveCurrency, currencyData, CURRENCIES };
}