'use client';

import { useState } from 'react';

interface PredictionResult {
  risk_level: string;
  risk_class: number;
  risk_score: number;
  probabilities: {
    low_risk: number;
    medium_risk: number;
    high_risk: number;
  };
  confidence: number;
}

export default function MLPredictPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    building_age: 15,
    roof_condition: 2,
    foundation_condition: 2,
    electrical_issues: 2,
    plumbing_issues: 1,
    structural_damage: 1,
    mold_presence: 0,
    pest_infestation: 0,
    window_condition: 2,
    paint_condition: 2,
    flooring_condition: 2,
    hvac_condition: 2,
    number_of_violations: 2,
    previous_repairs: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 40) return 'text-green-600';
    if (riskScore < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Building Risk Assessment</h1>
        
        <form onSubmit={handlePredict} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  type="number"
                  name={key}
                  value={value}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Get Risk Assessment'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Assessment Results</h2>
            
            <div className={`text-4xl font-bold mb-2 ${getRiskColor(result.risk_score)}`}>
              {result.risk_level}
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm font-bold">{result.risk_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.risk_score < 40
                      ? 'bg-green-600'
                      : result.risk_score < 70
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3">Confidence Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Low Risk</span>
                  <span className="font-medium">{result.probabilities.low_risk.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium Risk</span>
                  <span className="font-medium">{result.probabilities.medium_risk.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>High Risk</span>
                  <span className="font-medium">{result.probabilities.high_risk.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Confidence: <span className="font-semibold">{result.confidence.toFixed(1)}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
