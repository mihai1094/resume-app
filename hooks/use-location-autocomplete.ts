"use client";

import { useState, useRef, useCallback } from "react";
import { authFetch } from "@/lib/api/auth-fetch";

export interface PlacePrediction {
  description: string;
  placeId: string;
}

interface CacheEntry {
  predictions: PlacePrediction[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const CACHE_MAX_SIZE = 50;
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

function getCached(key: string): PlacePrediction[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.predictions;
}

function setCache(key: string, predictions: PlacePrediction[]): void {
  if (cache.size >= CACHE_MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { predictions, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function useLocationAutocomplete() {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPredictions = useCallback((query: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setPredictions([]);
      return;
    }

    const cached = getCached(trimmed);
    if (cached) {
      setPredictions(cached);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);

      try {
        const response = await authFetch(
          `/api/places/autocomplete?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setPredictions([]);
          return;
        }

        const data = (await response.json()) as { predictions: PlacePrediction[] };
        const results = data.predictions ?? [];
        setCache(trimmed, results);
        setPredictions(results);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearPredictions = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setPredictions([]);
    setIsLoading(false);
  }, []);

  return { predictions, isLoading, fetchPredictions, clearPredictions };
}
