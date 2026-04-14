import { useState } from 'react';
import { analyzeFiscal, FiscalAnalysis } from '../services/moteurFiscal';

export const useFiscalAnalysis = () => {
  const [analysis, setAnalysis] = useState<FiscalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (document: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFiscal(document);
      setAnalysis(result);
    } catch (err) {
      setError("Échec de l'analyse fiscale");
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, runAnalysis };
};