import React, { useState, useEffect } from 'react';

export default function DemoTutorial({ onTryPrompt }) {
  const [activeTab, setActiveTab] = useState('english');
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0); // 0: Idle, 1: Listening, 2: AI Parsing, 3: Bill Generated
  const [typedText, setTypedText] = useState('');
  const [progress, setProgress] = useState(0);

  // Speech examples with full text and clear phonetic fallbacks
  const speechExamples = {
    english: [
      { 
        text: "Apple, 2 kg, 100 rupees. Milk, 3 liter, 35 rupees.", 
        speechText: "Apple, 2 kg, 100 rupees. Milk, 3 liter, 35 rupees.",
        tag: "Grocery", 
        items: "2 items (Apple, Milk)" 
      },
      { 
        text: "Sugar 5 kg 45 rs, Rice 10 kg 60 rs, Oil 2 liter 140 rs.", 
        speechText: "Sugar 5 kg 45 rupees, Rice 10 kg 60 rupees, Oil 2 liter 140 rupees.",
        tag: "Bulk Order", 
        items: "3 items (Sugar, Rice, Oil)" 
      },
      { 
        text: "Bread 2 piece 40 rs, Butter 1 piece 55 rs.", 
        speechText: "Bread 2 piece 40 rupees, Butter 1 piece 55 rupees.",
        tag: "Unit Billing", 
        items: "2 items (Bread, Butter)" 
      }
    ],
    tamil: [
      { 
        text: "தக்காளி 2 கிலோ 40 ரூபாய், வெங்காயம் 3 கிலோ 60 ரூபாய்.", 
        speechText: "Thakkali rendu kilo naarpadhu roobai, Vengayam moonu kilo aruvadhu roobai.",
        tag: "மளிகை", 
        items: "2 பொருட்கள்" 
      },
      { 
        text: "பால் 2 லிட்டர் 35 ரூபாய், தயிர் 1 பாக்கெட் 20 ரூபாய்.", 
        speechText: "Paal rendu liter muppathianji roobai, Thayir oru packet irubadhu roobai.",
        tag: "தினசரி பால்", 
        items: "2 பொருட்கள்" 
      }
    ]
  };

  const sampleSpeech = "Apple, 2 kg, 100 rupees. Milk, 3 liter, 35 rupees.";

  // Handle Animated Video Simulator Playback Loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            setDemoStep(3);
            return 100;
          }
          return prev + 1.25;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync simulator stages based on progress
  useEffect(() => {
    if (!isPlaying && progress === 0) {
      setDemoStep(0);
      setTypedText('');
      return;
    }

    if (progress > 5 && progress <= 50) {
      setDemoStep(1); // Recording & Transcribing
      const charsToShow = Math.floor(((progress - 5) / 45) * sampleSpeech.length);
      setTypedText(sampleSpeech.slice(0, charsToShow));
    } else if (progress > 50 && progress <= 75) {
      setDemoStep(2); // AI Processing
      setTypedText(sampleSpeech);
    } else if (progress > 75) {
      setDemoStep(3); // Bill Generated
      setTypedText(sampleSpeech);
    }
  }, [progress, isPlaying]);

  const handleStartDemo = () => {
    setProgress(0);
    setTypedText('');
    setDemoStep(1);
    setIsPlaying(true);
  };

  // Speech Synthesizer with Tamil Voice Fallback
  const playAudioUtterance = (example) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    
    // Check if system has a native Tamil TTS engine installed
    const tamilVoice = voices.find(
      (v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil') || v.lang === 'ta-IN'
    );

    let utterance;

    if (activeTab === 'tamil') {
      if (tamilVoice) {
        // Native Tamil voice available
        utterance = new SpeechSynthesisUtterance(example.text);
        utterance.voice = tamilVoice;
        utterance.lang = tamilVoice.lang || 'ta-IN';
      } else {
        // Fallback: Phonetic Tanglish so standard Indian-English engine reads complete words
        utterance = new SpeechSynthesisUtterance(example.speechText);
        const indianEngVoice = voices.find((v) => v.lang === 'en-IN') || voices[0];
        if (indianEngVoice) utterance.voice = indianEngVoice;
        utterance.lang = 'en-IN';
      }
    } else {
      utterance = new SpeechSynthesisUtterance(example.speechText || example.text);
      const engVoice = voices.find((v) => v.lang === 'en-IN') || voices.find((v) => v.lang.startsWith('en')) || voices[0];
      if (engVoice) utterance.voice = engVoice;
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.88; // Slower rate for clear number recognition
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '100px', fontSize: '12px', color: '#c7d2fe', marginBottom: '10px' }}>
          <span style={{ width: '6px', height: '6px', background: '#818cf8', borderRadius: '50%' }}></span>
          Interactive System Walkthrough
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          Voice Billing Simulator & Speech Guide
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Watch how spoken instructions convert into structured invoices and instant PDF receipts.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Animated Video Simulator */}
        <div style={{ background: '#0e131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#818cf8' }}>🎬</span> Live Interactive Demo
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: isPlaying ? '#10b981' : '#94a3b8', background: isPlaying ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {isPlaying ? '● SIMULATING' : 'IDLE PREVIEW'}
            </span>
          </div>

          {/* Player Canvas Box */}
          <div style={{ position: 'relative', width: '100%', minHeight: '340px', background: 'radial-gradient(circle at center, #171f38 0%, #090d16 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            
            {/* Stage Indicator Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', zIndex: 2 }}>
              <div style={{ flex: 1, padding: '6px', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 600, background: demoStep >= 1 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.04)', color: demoStep >= 1 ? '#c7d2fe' : '#64748b', border: demoStep === 1 ? '1px solid #818cf8' : '1px solid transparent' }}>
                1. Voice Capture
              </div>
              <div style={{ flex: 1, padding: '6px', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 600, background: demoStep >= 2 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.04)', color: demoStep >= 2 ? '#c7d2fe' : '#64748b', border: demoStep === 2 ? '1px solid #818cf8' : '1px solid transparent' }}>
                2. AI Extraction
              </div>
              <div style={{ flex: 1, padding: '6px', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 600, background: demoStep >= 3 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.04)', color: demoStep >= 3 ? '#6ee7b7' : '#64748b', border: demoStep === 3 ? '1px solid #10b981' : '1px solid transparent' }}>
                3. Final Invoice
              </div>
            </div>

            {/* Main Animated Stage Area */}
            <div style={{ margin: 'auto 0', textAlign: 'center', zIndex: 2, width: '100%' }}>
              {demoStep === 0 && (
                <div style={{ padding: '20px 0' }}>
                  <div 
                    style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#fff', cursor: 'pointer', boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)' }} 
                    onClick={handleStartDemo}
                  >
                    ▶
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 6px 0' }}>Click Play to Watch Automated Workflow</h4>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Simulates speech-to-invoice pipeline in 8 seconds</p>
                </div>
              )}

              {demoStep === 1 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                    LISTENING & TRANSCRIBING...
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', maxWidth: '420px', margin: '0 auto', color: '#f8fafc', fontSize: '14px', minHeight: '48px', textAlign: 'left' }}>
                    🎙️ "{typedText}<span style={{ borderRight: '2px solid #818cf8' }}></span>"
                  </div>
                </div>
              )}

              {demoStep === 2 && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ color: '#818cf8', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
                    ⚡ GEMINI PARSING JSON ENTITIES...
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '12px', maxWidth: '380px', margin: '0 auto', textAlign: 'left', fontSize: '12px', fontFamily: 'monospace', color: '#a5b4fc' }}>
                    {"{\n  \"items\": [\"Apple (2kg)\", \"Milk (3L)\"],\n  \"total\": 305.00\n}"}
                  </div>
                </div>
              )}

              {demoStep === 3 && (
                <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'left', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px', maxWidth: '420px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#10b981', fontSize: '13px' }}>✓ Invoice Generated</span>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>Total: ₹ 305.00</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>
                    • Apple (2 kg @ ₹100/kg) → <strong>₹ 200.00</strong><br/>
                    • Milk (3 liter @ ₹35/L) → <strong>₹ 105.00</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Progress Bar & Controls */}
            <div style={{ zIndex: 2 }}>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.1s linear' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : handleStartDemo}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isPlaying ? '⏸ Pause' : progress === 100 ? '🔄 Replay Demo' : '▶ Play Simulation'}
                </button>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {Math.round(progress)}% Completed
                </span>
              </div>
            </div>

          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
              <strong>Best Practice:</strong> Speak with standard units like <em>kg, liter, packet, piece</em>. The AI automatically parses quantity multipliers.
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: Speech Syntax Guide & Practice */}
        <div style={{ background: '#0e131f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#38bdf8' }}>🗣️</span> Speech Syntax Guide
            </span>

            {/* Language Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setActiveTab('english')}
                style={{ border: 'none', background: activeTab === 'english' ? '#6366f1' : 'transparent', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              >
                English
              </button>
              <button
                onClick={() => setActiveTab('tamil')}
                style={{ border: 'none', background: activeTab === 'tamil' ? '#6366f1' : 'transparent', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Speech Formula Box */}
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Voice Formula:
            </span>
            <p style={{ margin: '6px 0 0 0', color: '#f8fafc', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>
              [Product] + [Qty] [Unit] + [Price] rupees
            </p>
          </div>

          {/* List of Speech Examples with Integrated Test Audio & Try Live Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {speechExamples[activeTab].map((example, idx) => (
              <div 
                key={idx}
                style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    {example.tag}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {example.items}
                  </span>
                </div>

                <div style={{ color: '#f1f5f9', fontSize: '13px', lineHeight: '1.5', fontWeight: 500 }}>
                  "{example.text}"
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <button
                    onClick={() => playAudioUtterance(example)}
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🔊 Test Audio
                  </button>
                  <button
                    onClick={() => onTryPrompt && onTryPrompt(example.text)}
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🚀 Try Live
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}