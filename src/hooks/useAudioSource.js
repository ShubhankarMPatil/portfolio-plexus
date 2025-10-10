// src/hooks/useAudioSource.js
import { useEffect, useState } from "react";

export function useAudioSource(audioRef, mode = "internal") {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(new Uint8Array(64));
  const [isPlaying, setIsPlaying] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let context = null;
    let analyserNode = null;
    let source = null;
    let animationFrame = null;

    const cleanup = async () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (source) {
        try {
          source.disconnect();
        } catch (_) {}
      }
      if (analyserNode) {
        try {
          analyserNode.disconnect();
        } catch (_) {}
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (context && context.state !== "closed") {
        try {
          await context.close();
        } catch (_) {}
      }
    };

    const initInternal = () => {
      if (!audioRef.current) return;

      context = new (window.AudioContext || window.webkitAudioContext)();
      analyserNode = context.createAnalyser();
      source = context.createMediaElementSource(audioRef.current);

      analyserNode.fftSize = 128;
      source.connect(analyserNode);
      analyserNode.connect(context.destination);

      setAudioContext(context);
      setAnalyser(analyserNode);

      const bufferLength = analyserNode.frequencyBinCount;
      const arr = new Uint8Array(bufferLength);

      const tick = () => {
        analyserNode.getByteFrequencyData(arr);
        setDataArray([...arr]);
        animationFrame = requestAnimationFrame(tick);
      };
      tick();
    };

    const initExternal = async () => {
      try {
        const newStream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: false,
        });
        setStream(newStream);

        context = new (window.AudioContext || window.webkitAudioContext)();
        analyserNode = context.createAnalyser();
        source = context.createMediaStreamSource(newStream);

        analyserNode.fftSize = 128;
        source.connect(analyserNode);

        setAudioContext(context);
        setAnalyser(analyserNode);

        const bufferLength = analyserNode.frequencyBinCount;
        const arr = new Uint8Array(bufferLength);

        const tick = () => {
          analyserNode.getByteFrequencyData(arr);
          setDataArray([...arr]);
          animationFrame = requestAnimationFrame(tick);
        };
        tick();
      } catch (err) {
        console.warn("User cancelled or tab sharing not supported:", err);
      }
    };

    // Initialize correct mode
    if (mode === "internal") initInternal();
    else initExternal();

    // Cleanup safely
    return () => {
      cleanup();
    };
  }, [mode, audioRef]);

  return { dataArray, isPlaying, setIsPlaying };
}
