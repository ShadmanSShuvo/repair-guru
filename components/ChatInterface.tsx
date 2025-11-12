import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';
import MicrophoneIcon from './icons/MicrophoneIcon';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

// Helper functions for audio encoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatInterfaceProps {
  category: Category;
  onDiagnose: (description: string, image: { data: string; mimeType: string } | null) => void;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ category, onDiagnose, isLoading, error, onBack }) => {
  const { t, language } = useLanguage();
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for audio processing and Live API session
  const sessionRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef<string>('');

  const cleanupAudio = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    transcriptRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const startRecording = async () => {
    setRecognitionError(null);
    setIsRecording(true);
    transcriptRef.current = '';

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Fix: Cast window to `any` to allow access to vendor-prefixed `webkitAudioContext`.
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          inputAudioTranscription: {},
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a silent transcription assistant. Listen to the user and accurately transcribe their speech. Do not generate any spoken response.",
        },
        callbacks: {
          onopen: () => {
            if (scriptProcessorRef.current && mediaStreamSourceRef.current && audioContextRef.current) {
              scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
              scriptProcessorRef.current.connect(audioContextRef.current.destination);
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              transcriptRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const fullTranscription = transcriptRef.current;
              if (fullTranscription.trim()) {
                setDescription(prev => (prev ? prev.trim() + ' ' : '') + fullTranscription.trim());
              }
              transcriptRef.current = '';
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error:', e);
            setRecognitionError(t('error_live_connection'));
            cleanupAudio();
          },
          onclose: () => {
            cleanupAudio();
          },
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setRecognitionError(t('error_live_mic_permission'));
      } else {
        setRecognitionError(t('error_live_generic'));
      }
      cleanupAudio();
    }
  };

  const stopRecording = () => {
    cleanupAudio();
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve({ data: base64Data, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!description && !imageFile) {
        alert(t('error_no_input'));
        return;
    }

    let imagePayload: { data: string; mimeType: string } | null = null;
    if (imageFile) {
      imagePayload = await fileToBase64(imageFile);
    }
    
    onDiagnose(description, imagePayload);
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 animate-fade-in-up">
       <div className="flex justify-between items-start mb-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('diagnose_title')}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t('diagnose_category')}: <span className="font-semibold text-sky-500">{t(category.name.toLowerCase())}</span></p>
        </div>
        <button onClick={onBack} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">&larr; {t('change_category')}</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('describe_problem_label')}
            </label>
            <button 
              type="button" 
              onClick={handleToggleRecording} 
              className={`p-1 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300'}`} 
              aria-label={t('record_voice_label')}
            >
                <MicrophoneIcon className="w-5 h-5" />
            </button>
          </div>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setRecognitionError(null);
            }}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder={t('describe_problem_placeholder')}
          />
          {isRecording && <p className="text-slate-500 text-sm mt-1 italic transition-opacity duration-300" aria-live="polite">{t('listening')}</p>}
          {recognitionError && <p className="text-red-500 text-sm mt-1">{recognitionError}</p>}
        </div>

        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('upload_photo_label')}
            </label>
            <div 
                onClick={triggerFileSelect} 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition"
            >
                <div className="space-y-1 text-center">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto object-contain rounded-md" />
                    ) : (
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                        <p className="pl-1">{imageFile ? `${t('selected_file')} ${imageFile.name}` : t('upload_photo_text')}</p>
                    </div>
                     <p className="text-xs text-slate-500 dark:text-slate-500">{t('upload_photo_hint')}</p>
                </div>
            </div>
            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*"/>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-100 dark:bg-red-900/20 p-3 rounded-md">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || isRecording}
          className="w-full flex justify-center items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('diagnosing_btn')}
            </>
          ) : isRecording ? (
             t('stop_recording_btn')
          ) : (
             t('generate_ticket_btn')
          )
        }
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;