// src/hooks/useCurrency.ts
import { useState, useEffect, useCallback } from "react";

export type Currency = "COP" | "USD";

const CACHE_KEY     = "exchange_rate_cache";
const CACHE_TTL_MS  = 1000 * 60 * 60 * 24; // 24 horas
const FALLBACK_RATE = 4100; // tasa de respaldo si falla la API

// ── Tasa en caché o fetch desde API gratuita (sin API key) ───
const fetchUSDtoCOP = async (): Promise<number> => {
  try {
    // Revisar caché primero
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rate, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return rate;
      }
    }

    // API gratuita de exchangerate-api.com — sin key, actualizada diariamente
    const res  = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();

    if (data.result === "success" && data.rates?.COP) {
      const rate = data.rates.COP;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
      return rate;
    }

    return FALLBACK_RATE;
  } catch {
    return FALLBACK_RATE;
  }
};

// ── Detecta país por IP ───────────────────────────────────────
const detectCountry = async (): Promise<string> => {
  try {
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code || "US";
  } catch {
    return "US";
  }
};

// ── Hook principal ────────────────────────────────────────────
export interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (priceInCOP: number) => string;
  convert: (priceInCOP: number) => number;
  usdToCOP: number;
  isLoadingRate: boolean;
  maxPrice: number;
  step: number;
}

export const useCurrency = (): CurrencyState => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("preferred_currency");
    if (saved === "COP" || saved === "USD") return saved;
    return "COP";
  });

  const [usdToCOP, setUsdToCOP]         = useState<number>(FALLBACK_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Carga tasa de cambio al montar
  useEffect(() => {
    setIsLoadingRate(true);
    fetchUSDtoCOP()
      .then(rate => setUsdToCOP(rate))
      .finally(() => setIsLoadingRate(false));
  }, []);

  // Detecta país solo si no hay preferencia guardada
  useEffect(() => {
    if (localStorage.getItem("preferred_currency")) return;
    detectCountry().then(country => {
      setCurrencyState(country === "CO" ? "COP" : "USD");
    });
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    localStorage.setItem("preferred_currency", c);
    setCurrencyState(c);
  }, []);

  // Precios en DB están en COP
  const convert = useCallback((priceInCOP: number): number => {
    if (currency === "USD") return priceInCOP / usdToCOP;
    return priceInCOP;
  }, [currency, usdToCOP]);

  const format = useCallback((priceInCOP: number): string => {
    const value = convert(priceInCOP);
    if (currency === "COP") {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, [currency, convert]);

  return {
    currency,
    setCurrency,
    format,
    convert,
    usdToCOP,
    isLoadingRate,
    maxPrice: currency === "COP" ? 1_000_000 : Math.round(1_000_000 / usdToCOP),
    step:     currency === "COP" ? 10_000    : 5,
  };
};