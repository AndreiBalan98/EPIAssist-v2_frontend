'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { api } from '@/lib/api';

type Stage = 'idle' | 'uploading' | 'done' | 'error';

const STEPS = [
  { label: 'Uploading document', key: 'upload' },
  { label: 'Extracting table of contents', key: 'toc' },
  { label: 'Generating embeddings', key: 'embeddings' },
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<{ name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !name) {
      setName(selected.name.replace(/\.[^/.]+$/, ''));
    }
  }

  async function handleUpload() {
    if (!file || !name.trim()) return;
    setStage('uploading');
    setActiveStep(0);
    setError(null);
    setResult(null);

    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1800);

    try {
      const data = await api.uploadDocument(name.trim(), file);
      clearInterval(stepInterval);
      setActiveStep(STEPS.length - 1);
      await new Promise(r => setTimeout(r, 400));
      setResult(data);
      setStage('done');
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setStage('error');
    }
  }

  function handleReset() {
    setFile(null);
    setName('');
    setStage('idle');
    setActiveStep(0);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-bg-warm flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
        <h1 className="text-2xl font-semibold text-dark mb-1">Upload Document</h1>
        <p className="text-sm text-gray-400 mb-8">Dev only — not linked anywhere</p>

        {stage === 'idle' || stage === 'error' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-light mb-1.5">Document name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ordin 1410/2016"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-light mb-1.5">File</label>
              <div
                className="relative border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="space-y-1">
                    <div className="text-2xl">📄</div>
                    <p className="text-sm font-medium text-dark">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl text-gray-300">↑</div>
                    <p className="text-sm text-gray-400">Click to select a file</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {stage === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || !name.trim()}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Upload
            </button>
          </div>
        ) : stage === 'uploading' ? (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-primary animate-spin" />
            </div>
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-500 ${
                    i < activeStep
                      ? 'bg-green-100 text-green-600'
                      : i === activeStep
                      ? 'bg-orange-100 text-primary'
                      : 'bg-gray-100 text-gray-300'
                  }`}>
                    {i < activeStep ? '✓' : i === activeStep ? (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse block" />
                    ) : '○'}
                  </div>
                  <span className={`text-sm transition-colors duration-500 ${
                    i < activeStep ? 'text-green-600' : i === activeStep ? 'text-dark font-medium' : 'text-gray-300'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                ✓
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-dark">{result?.name}</p>
              <p className="text-sm text-gray-400">Document processed successfully</p>
            </div>
            <div className="space-y-2">
              {STEPS.map(step => (
                <div key={step.key} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0">
                    ✓
                  </div>
                  <span className="text-sm text-green-700">{step.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-orange-200 text-primary text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              Upload another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
