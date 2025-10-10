import { useState, useEffect, useRef } from "react";

export default function useAudioSource(audioRef, mode) {
  const [dataArray, setDataArray] = useState(new Uint8Array(64));
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const externalStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    // Initialize AudioContext once
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const context = audioContextRef.current;

    if (mode === "internal") {
      // Stop any external stream first
      if (externalStreamRef.current) {
        externalStreamRef.current.getTracks().forEach((t) => t.stop());
        externalStreamRef.current = null;
      }

      // Resume context and play internal audio
      context.resume();
      const audioEl = audioRef.current;

      // Only create MediaElementSource once per element
      if (!sourceNodeRef.current) {
        const src = context.createMediaElementSource(audioEl);
        const analyser = context.createAnalyser();
        analyser.fftSize = 128;
        src.connect(analyser);
        analyser.connect(context.destination);
        sourceNodeRef.current = src;
        analyserRef.current = analyser;
      }

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const tempArray = new Uint8Array(bufferLength);

      const tick = () => {
        analyser.getByteFrequencyData(tempArray);
        setDataArray([...tempArray]);
        requestAnimationFrame(tick);
      };
      tick();

      setIsPlaying(!audioEl.paused);
    }

    if (mode === "external") {
      // Pause internal audio
      audioRef.current.pause();

      (async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: false,
          });
          externalStreamRef.current = mediaStream;

          const analyser = context.createAnalyser();
          analyser.fftSize = 128;
          const src = context.createMediaStreamSource(mediaStream);
          src.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const tempArray = new Uint8Array(bufferLength);

          const tick = () => {
            analyser.getByteFrequencyData(tempArray);
            setDataArray([...tempArray]);
            requestAnimationFrame(tick);
          };
          tick();

          setIsPlaying(true);
        } catch (err) {
          console.warn("User cancelled tab sharing:", err);
          setIsPlaying(false);
        }
      })();
    }

    return () => {
      // Clean up only external streams (internal audio remains stable)
      if (mode === "external" && externalStreamRef.current) {
        externalStreamRef.current.getTracks().forEach((t) => t.stop());
        externalStreamRef.current = null;
      }
    };
  }, [mode, audioRef]);

  return { dataArray, isPlaying };
}
