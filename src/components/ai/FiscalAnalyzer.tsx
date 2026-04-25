import React, { useState } from 'react';
import { analyzeFiscal, FiscalAnalysis } from '../../services/moteurFiscal';
import { Button } from '../ui/Button';
import { Calculator, AlertCircle, Sparkles } from 'lucide-react';

interface FiscalAnalyzerProps {
  invoiceId: string;
  items: any[];
  taxRate: number;
  currency: string;
  onApplySuggestion?: (suggestions: string[]) => void;
}

export const FiscalAnalyzer: React.FC<FiscalAnalyzerProps> = ({
  invoiceId,
  items: _items,
  taxRate: _taxRate,
  currency,
  onApplySuggestion,
}) => {
  const [analysis, setAnalysis] = useState<FiscalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFiscal(invoiceId);
      setAnalysis(result);
    } catch (err) {
      setError("Échec de l'analyse fiscale");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestions = () => {
    if (analysis?.suggestions && onApplySuggestion) {
      onApplySuggestion(analysis.suggestions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-gray-800">Agent Moteur Fiscal</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={runAnalysis} disabled={loading}>
          {loading ? 'Analyse en cours...' : 'Lancer l’analyse'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {analysis && (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total HT détecté</span>
            <span className="font-mono font-bold">
              {analysis.subtotal.toFixed(3)} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">TVA ({analysis.tvaRate}%)</span>
            <span className="font-mono">
              {analysis.tvaAmount.toFixed(3)} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Timbre fiscal</span>
            <span className="font-mono">
              {analysis.timbreAmount.toFixed(3)} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">RAS ({analysis.rasRate}%)</span>
            <span className="font-mono text-red-600">
              -{analysis.rasAmount.toFixed(3)} {currency}
            </span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
            <span>Total TTC calculé</span>
            <span className="text-accent">
              {analysis.total.toFixed(3)} {currency}
            </span>
          </div>

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-3 mt-2">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <Sparkles size={12} /> Suggestions
              </p>
              <ul className="list-disc list-inside text-xs text-amber-600 mt-1">
                {analysis.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <button
                onClick={applySuggestions}
                className="mt-2 text-xs font-bold text-accent underline hover:no-underline"
              >
                Appliquer les corrections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};