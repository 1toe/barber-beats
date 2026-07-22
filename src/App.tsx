import React, { useId } from 'react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useExporter } from './hooks/useExporter';
import { WaveformDisplay } from './components/WaveformDisplay';
import { SpectrumAnalyzer } from './components/SpectrumAnalyzer';

export default function App() {
  const fileInputId = useId();
  const playbackId = useId();
  const lowPassId = useId();
  const bassId = useId();
  const reverbId = useId();

  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  const [playbackRate, setPlaybackRate] = React.useState(0.85);

  const [lowPassEnabled, setLowPassEnabled] = React.useState(true);
  const [lowPassFreq, setLowPassFreq] = React.useState(4500);

  const [bassBoostEnabled, setBassBoostEnabled] = React.useState(true);
  const [bassBoost, setBassBoost] = React.useState(4);

  const [reverbEnabled, setReverbEnabled] = React.useState(true);
  const [reverbMix, setReverbMix] = React.useState(0.15);

  const [normalizeEnabled, setNormalizeEnabled] = React.useState(true);
  const [theme, setTheme] = React.useState<'deep-space' | 'high-contrast'>('deep-space');
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  const { loadAudio, updateParams, togglePlay, isPlaying, audioElement, getAnalyser } = useAudioEngine();
  const { exportAudio, isProcessing, progress, log } = useExporter();

  React.useEffect(() => {
    let timer: any;
    if (isProcessing) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isProcessing]);

  React.useEffect(() => {
    updateParams({
      playbackRate,
      lowPassFreq, lowPassEnabled,
      bassBoost, bassBoostEnabled,
      reverbMix, reverbEnabled,
      normalizeEnabled
    });
  }, [playbackRate, lowPassFreq, lowPassEnabled, bassBoost, bassBoostEnabled, reverbMix, reverbEnabled, normalizeEnabled, updateParams]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      loadAudio(file);
    }
  };

  const applyPreset = (rate: number, lp: number, bass: number, reverb: number) => {
    setPlaybackRate(rate);
    setLowPassEnabled(true);
    setLowPassFreq(lp);
    setBassBoostEnabled(true);
    setBassBoost(bass);
    setReverbEnabled(true);
    setReverbMix(reverb);
    setNormalizeEnabled(true);
  };

  const isHighContrast = theme === 'high-contrast';

  return (
    <main className={`min-h-screen p-6 md:p-12 flex flex-col items-center justify-center transition-colors ${isHighContrast ? 'bg-black text-white' : 'bg-zinc-950 text-zinc-100'}`}>
      <div className="w-full max-w-xl">
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className={`font-display text-3xl font-bold tracking-tight ${isHighContrast ? 'text-white' : 'text-zinc-50'}`}>
              Barber Beater
            </h1>
            <p className={`${isHighContrast ? 'text-zinc-300' : 'text-zinc-400'} text-sm leading-relaxed`}>
              Process audio with pitch, filter, and spatial effects locally.
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'deep-space' ? 'high-contrast' : 'deep-space')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 ${isHighContrast
              ? 'bg-white text-black border-white hover:bg-zinc-200 focus-visible:ring-black'
              : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800 focus-visible:ring-zinc-400'
              }`}
            aria-label="Toggle High Contrast Accessibility Mode"
          >
            {isHighContrast ? 'High Contrast Mode (On)' : 'Theme: Deep Space'}
          </button>
        </header>

        <div className="space-y-10">
          {/* Source Audio */}
          <section className="space-y-4" aria-labelledby="source-audio-heading">
            <h2 id="source-audio-heading" className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">
              Source Audio
            </h2>

            <div className="relative group">
              <input
                id={fileInputId}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-lg"
                aria-label="Upload audio file"
              />
              <div
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${audioFile
                  ? 'border-zinc-500 bg-zinc-800/50'
                  : 'border-zinc-800 bg-zinc-900/50 group-hover:border-zinc-600 group-hover:bg-zinc-800'
                  }`}
                aria-hidden="true"
              >
                <div className={`p-3 rounded-full ${audioFile ? 'bg-zinc-700' : 'bg-zinc-800'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={audioFile ? "text-zinc-200" : "text-zinc-400"}>
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-zinc-200 mb-1">
                    {audioFile ? audioFile.name : 'Select Audio'}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {audioFile ? 'Click to replace' : 'MP3 or WAV'}
                  </span>
                </div>
              </div>
            </div>

            <WaveformDisplay file={audioFile} audioElement={audioElement} />
          </section>

          {/* Controls */}
          <section className="space-y-6" aria-labelledby="controls-heading">
            <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-4 flex-1">
                <h2 id="controls-heading" className="text-sm font-medium text-zinc-300">
                  Parameters
                </h2>
                <div className="flex-1 max-w-[120px] mb-1">
                  <SpectrumAnalyzer getAnalyser={getAnalyser} isPlaying={isPlaying} />
                </div>
              </div>

              <button
                onClick={togglePlay}
                disabled={!audioFile}
                aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${!audioFile
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                  : isPlaying
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  }`}
              >
                {isPlaying ? 'Pause' : 'Preview'}
              </button>
            </div>

            <div className="space-y-8">
              {/* Presets */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-300">Barber Beats Presets</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    onClick={() => applyPreset(0.85, 4000, 4, 0.15)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Haircut Lounge
                  </button>
                  <button
                    onClick={() => applyPreset(0.75, 2500, 6, 0.25)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Late Night
                  </button>
                  <button
                    onClick={() => applyPreset(0.80, 6000, 2, 0.35)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Vapor Drip
                  </button>
                  <button
                    onClick={() => applyPreset(0.90, 8000, 2, 0.10)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Clean Cut
                  </button>
                  <button
                    onClick={() => applyPreset(0.65, 1500, 8, 0.40)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Macroblank
                  </button>
                  <button
                    onClick={() => applyPreset(0.85, 3000, 3, 0.60)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    80s Mall
                  </button>
                  <button
                    onClick={() => applyPreset(0.70, 2000, 5, 0.30)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    VHS Dream
                  </button>
                  <button
                    onClick={() => applyPreset(0.60, 1000, 7, 0.50)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Slushwave
                  </button>
                </div>
              </div>

              {/* Playback Rate */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label htmlFor={playbackId} className="text-zinc-300 font-medium">Tempo & Pitch</label>
                  <span className="text-zinc-400 font-mono" aria-hidden="true">{playbackRate.toFixed(2)}x</span>
                </div>
                <input
                  id={playbackId}
                  type="range" min="0.5" max="1.5" step="0.01"
                  value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-full"
                  aria-valuetext={`${playbackRate.toFixed(2)} times normal speed`}
                />
              </div>

              {/* LowPass Filter */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300 font-medium flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lowPassEnabled}
                      onChange={e => setLowPassEnabled(e.target.checked)}
                      className="accent-zinc-400 w-4 h-4 rounded border-zinc-800 bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
                      aria-label="Enable Low-Pass Filter"
                    />
                    Low-Pass Filter
                  </label>
                  <span className={`font-mono transition-opacity ${lowPassEnabled ? 'text-zinc-400' : 'text-zinc-600'}`} aria-hidden="true">{lowPassFreq} Hz</span>
                </div>
                <input
                  id={lowPassId}
                  type="range" min="500" max="20000" step="100"
                  value={lowPassFreq} onChange={(e) => setLowPassFreq(parseFloat(e.target.value))}
                  disabled={!lowPassEnabled}
                  className={`w-full transition-opacity ${!lowPassEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  aria-label="Low-pass filter cutoff frequency"
                  aria-valuetext={`${lowPassFreq} Hertz`}
                />
              </div>

              {/* Bass Boost */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300 font-medium flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bassBoostEnabled}
                      onChange={e => setBassBoostEnabled(e.target.checked)}
                      className="accent-zinc-400 w-4 h-4 rounded border-zinc-800 bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
                      aria-label="Enable Bass Boost"
                    />
                    Bass Boost (100Hz)
                  </label>
                  <span className={`font-mono transition-opacity ${bassBoostEnabled ? 'text-zinc-400' : 'text-zinc-600'}`} aria-hidden="true">+{bassBoost} dB</span>
                </div>
                <input
                  id={bassId}
                  type="range" min="0" max="15" step="1"
                  value={bassBoost} onChange={(e) => setBassBoost(parseFloat(e.target.value))}
                  disabled={!bassBoostEnabled}
                  className={`w-full transition-opacity ${!bassBoostEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  aria-label="Bass boost gain"
                  aria-valuetext={`+${bassBoost} decibels`}
                />
              </div>

              {/* Reverb Mix */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300 font-medium flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reverbEnabled}
                      onChange={e => setReverbEnabled(e.target.checked)}
                      className="accent-zinc-400 w-4 h-4 rounded border-zinc-800 bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
                      aria-label="Enable Reverb"
                    />
                    Reverb
                  </label>
                  <span className={`font-mono transition-opacity ${reverbEnabled ? 'text-zinc-400' : 'text-zinc-600'}`} aria-hidden="true">{(reverbMix * 100).toFixed(0)}%</span>
                </div>
                <input
                  id={reverbId}
                  type="range" min="0" max="1" step="0.01"
                  value={reverbMix} onChange={(e) => setReverbMix(parseFloat(e.target.value))}
                  disabled={!reverbEnabled}
                  className={`w-full transition-opacity ${!reverbEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  aria-label="Reverb mix percentage"
                  aria-valuetext={`${(reverbMix * 100).toFixed(0)} percent`}
                />
              </div>

              {/* Normalize Audio */}
              <div className="pt-2">
                <label className="text-zinc-300 font-medium flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={normalizeEnabled}
                    onChange={e => setNormalizeEnabled(e.target.checked)}
                    className="accent-zinc-400 w-4 h-4 rounded border-zinc-800 bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer"
                    aria-label="Enable Audio Normalization"
                  />
                  Normalize Audio (Prevent Clipping)
                </label>
                <p className="text-xs text-zinc-500 mt-1.5 ml-7">
                  Applies a final gain pass and compression to ensure the output doesn't distort.
                </p>
              </div>
            </div>
          </section>

          {/* Export */}
          <section className="pt-6 border-t border-zinc-800" aria-label="Export">
            <button
              onClick={() => exportAudio({ audioFile, playbackRate, lowPassFreq, lowPassEnabled, bassBoost, bassBoostEnabled, reverbMix, reverbEnabled, normalizeEnabled })}
              disabled={!audioFile || isProcessing}
              className="w-full bg-zinc-100 hover:bg-white disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 disabled:border disabled:opacity-100 disabled:cursor-not-allowed text-zinc-950 text-sm font-semibold py-3.5 px-4 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 flex justify-center items-center gap-2"
              aria-busy={isProcessing}
            >
              {isProcessing ? 'Processing Audio...' : 'Export Processed Audio'}
            </button>

            {/* Processing State */}
            {isProcessing && (
              <div className="mt-6 space-y-3" role="status" aria-live="polite">
                <div className="flex justify-between text-xs font-medium text-zinc-400">
                  <span>Rendering... ({Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')})</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-zinc-300 transition-all duration-200 ease-linear rounded-full"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div
                  className="font-mono text-[11px] text-zinc-500 leading-relaxed space-y-1 max-h-32 overflow-y-auto bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50"
                  aria-label="Processing logs"
                >
                  {log.length === 0 ? (
                    <div className="animate-pulse">Initializing processing engine...</div>
                  ) : (
                    log.map((l, i) => <div key={i}>{l}</div>)
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
