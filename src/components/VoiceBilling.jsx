import React, { useState, useRef, useEffect } from 'react';
import { API } from '../services/api';

const VoiceBilling = ({ onBillGenerated }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [transcribingText, setTranscribingText] = useState('');
    const [error, setError] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        setError('');
        setTranscribingText('');
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Check supported mime types
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/ogg' };
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Combine audio chunks into a single Blob
                const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
                console.log("Audio recording stopped. Blob size:", audioBlob.size);
                
                // Close microphone stream track releases
                stream.getTracks().forEach(track => track.stop());

                // Upload to backend
                uploadAudio(audioBlob);
            };

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Microphone access denied:", err);
            setError("❌ Microphone access denied. Please grant permission in your browser settings to record voice.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const uploadAudio = async (audioBlob) => {
        setIsLoading(true);
        setTranscribingText('Uploading voice and contacting AssemblyAI transcription services...');
        setError('');

        try {
            // Polling is done in the Spring Boot backend service
            // This endpoint blocks until AssemblyAI completes transcription, then Gemini parses and saves
            const data = await API.generateBillFromVoice(audioBlob);
            console.log("Voice bill generated successfully:", data);
            
            setTranscribingText('Successfully generated invoice!');
            onBillGenerated(data);
        } catch (err) {
            console.error("Voice billing failed:", err);
            setError("❌ Speech-to-text billing failed. Verify your backend server AssemblyAI key is active.");
        } finally {
            setIsLoading(false);
            setTranscribingText('');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setTranscribingText('Uploading and transcribing pre-recorded audio file...');
        setError('');

        try {
            const data = await API.uploadAudioFile(file);
            console.log("Uploaded audio billing success:", data);
            setTranscribingText('Successfully generated invoice!');
            onBillGenerated(data);
        } catch (err) {
            console.error("Audio upload billing failed:", err);
            setError("❌ Audio file parsing failed. Ensure the format is valid and backend server is active.");
        } finally {
            setIsLoading(false);
            setTranscribingText('');
        }
    };

    // Format timer: e.g., 0:05
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="glass-card recorder-box" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Voice Billing Recorder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px', maxWidth: '380px' }}>
                Click the microphone, state the bill details (e.g. "three kg potato for thirty rupees total"), then click stop.
            </p>

            {/* Glowing Microphone Button */}
            <div 
                className={`record-btn-trigger ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
            >
                {isRecording ? "⏹️" : "🎙️"}
            </div>

            {/* Status Information */}
            {isRecording && (
                <div>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
                        Recording... ({formatTime(recordingTime)})
                    </span>
                    <div className="wave-visualizer active">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}

            {!isRecording && !isLoading && (
                <div style={{ width: '100%' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                        Click button to start recording voice
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', margin: '10px 0' }}>
                        — OR —
                    </span>
                    <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                        <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', display: 'inline-flex', gap: '8px' }}>
                            📁 Upload Audio File
                            <input 
                                type="file" 
                                accept="audio/*" 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }} 
                            />
                        </label>
                    </div>
                </div>
            )}

            {isLoading && (
                <div style={{ width: '100%' }}>
                    <span style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '600' }}>
                        {transcribingText}
                    </span>
                    <div className="thinking" style={{ justifyContent: 'center', marginTop: '10px' }}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}

            {error && (
                <div className="msg-alert error" style={{ marginTop: '20px', width: '100%' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceBilling;
