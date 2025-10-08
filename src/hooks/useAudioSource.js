import { useState, useEffect, useRef } from "react";

/**
 * Unified hook to handle both internal audio (HTMLAudioElement)
 * and external audio (captured from another browser tab).
 */
export default function useAudioSource(audioRef) {
  const [dataArray, setDataArray] = useState(new Uint8Array(64));
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("internal"); // "internal" or "external"
  const [stream, setStream] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // 🔊 INTERNAL MODE: use <audio> element
  useEffect(() => {
    if (mode !== "internal" || !audioRef.current) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createMediaElementSource(audioRef.current);
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyser.connect(context.destination);

    audioContextRef.current = context;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const newArray = new Uint8Array(bufferLength);

    const tick = () => {
      analyser.getByteFrequencyData(newArray);
      setDataArray([...newArray]);
      requestAnimationFrame(tick);
    };
    tick();

    setIsPlaying(!audioRef.current.paused);

    return () => {
      source.disconnect();
      analyser.disconnect();
      context.close();
    };
  }, [mode, audioRef]);

  // 🎧 EXTERNAL MODE: capture tab audio via getDisplayMedia
  useEffect(() => {
    if (mode !== "internal" || !audioRef.current) return;
  
    // 🔒 Prevent duplicate connection
    if (audioContextRef.current) return;
  
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
  
    const source = context.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(context.destination);
  
    audioContextRef.current = context;
    analyserRef.current = analyser;
  
    const bufferLength = analyser.frequencyBinCount;
    const newArray = new Uint8Array(bufferLength);
  
    const tick = () => {
      analyser.getByteFrequencyData(newArray);
      setDataArray([...newArray]);
      requestAnimationFrame(tick);
    };
    tick();
  
    setIsPlaying(!audioRef.current.paused);
  
    return () => {
      try {
        source.disconnect();
        analyser.disconnect();
        context.close();
        audioContextRef.current = null;
      } catch (e) {
        console.warn("Cleanup error:", e);
      }
    };
  }, [mode, audioRef]);
  

  const togglePlayback = () => {
    if (mode === "internal" && audioRef.current) {
      const audioEl = audioRef.current;
      if (audioEl.paused) {
        audioEl.play();
        audioContextRef.current?.resume();
        setIsPlaying(true);
      } else {
        audioEl.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMode = () => {
    if (mode === "internal") {
      // Switch to external mode — ask permission
      setMode("external");
      if (audioRef.current) audioRef.current.pause();
    } else {
      // Switch back to internal mode
      if (stream) stream.getTracks().forEach(t => t.stop());
      setMode("internal");
    }
  };

  return { dataArray, isPlaying, mode, togglePlayback, toggleMode };
}
