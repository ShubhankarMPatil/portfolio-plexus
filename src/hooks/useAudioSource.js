import { useState, useEffect, useRef, useCallback } from "react";

export default function useAudioSource(audioRef, mode) {
  const [dataArray, setDataArray] = useState(new Uint8Array(64));
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const externalStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const internalSourceNodeRef = useRef(null);
  const externalSourceNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const modeRef = useRef(mode);

  // Update mode ref when mode changes
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Function to request external audio - must be called from user interaction
  const requestExternalAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const context = audioContextRef.current;
    
    // Pause internal audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // Request display media - this will show the popup
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });

      // Check if we still want external mode (user might have switched back)
      if (modeRef.current !== "external") {
        mediaStream.getTracks().forEach((t) => t.stop());
        return;
      }

      // Stop any previous external stream
      if (externalStreamRef.current) {
        externalStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      externalStreamRef.current = mediaStream;

      // Clean up previous external source node
      if (externalSourceNodeRef.current) {
        externalSourceNodeRef.current.disconnect();
        externalSourceNodeRef.current = null;
      }

      // Create new analyser and source for external stream
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      const src = context.createMediaStreamSource(mediaStream);
      src.connect(analyser);
      analyser.connect(context.destination);
      
      externalSourceNodeRef.current = src;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const tempArray = new Uint8Array(bufferLength);

      // Start animation loop
      const tick = () => {
        if (modeRef.current === "external" && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(tempArray);
          setDataArray([...tempArray]);
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      };
      tick();

      setIsPlaying(true);

      // Listen for track ending (when user stops sharing or switches tabs)
      mediaStream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          // If we're still in external mode, the stream ended
          if (modeRef.current === "external") {
            setIsPlaying(false);
            setDataArray(new Uint8Array(64));
            
            // Clean up
            if (externalSourceNodeRef.current) {
              externalSourceNodeRef.current.disconnect();
              externalSourceNodeRef.current = null;
            }
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
            
            externalStreamRef.current = null;
            analyserRef.current = null;
          }
        };
      });

      // Listen for stream active state changes
      mediaStream.oninactive = () => {
        if (modeRef.current === "external") {
          setIsPlaying(false);
          setDataArray(new Uint8Array(64));
        }
      };

    } catch (err) {
      console.warn("User cancelled tab sharing or error occurred:", err);
      setIsPlaying(false);
      setDataArray(new Uint8Array(64));
      return false; // Return false to indicate cancellation/failure
    }
    
    return true; // Return true to indicate success
  }, [audioRef]);

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

      // Clean up external source node
      if (externalSourceNodeRef.current) {
        externalSourceNodeRef.current.disconnect();
        externalSourceNodeRef.current = null;
      }

      // Cancel external animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Resume context and play internal audio
      context.resume();
      const audioEl = audioRef.current;

      // Only create MediaElementSource once per element
      if (!internalSourceNodeRef.current) {
        const src = context.createMediaElementSource(audioEl);
        const analyser = context.createAnalyser();
        analyser.fftSize = 128;
        src.connect(analyser);
        analyser.connect(context.destination);
        internalSourceNodeRef.current = src;
        analyserRef.current = analyser;
      }
      // analyserRef.current should already be set from above

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const tempArray = new Uint8Array(bufferLength);

      const tick = () => {
        if (modeRef.current === "internal" && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(tempArray);
          setDataArray([...tempArray]);
          animationFrameRef.current = requestAnimationFrame(tick);
        }
      };
      tick();

      setIsPlaying(!audioEl.paused);
    }

    // Note: External mode setup is handled by requestExternalAudio callback
    // which must be called from user interaction

    return () => {
      // Clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clean up only external streams (internal audio remains stable)
      if (mode === "external" && externalStreamRef.current) {
        externalStreamRef.current.getTracks().forEach((t) => t.stop());
        externalStreamRef.current = null;
      }
      
      if (mode === "external" && externalSourceNodeRef.current) {
        externalSourceNodeRef.current.disconnect();
        externalSourceNodeRef.current = null;
      }
    };
  }, [mode, audioRef]);

  return { dataArray, isPlaying, requestExternalAudio };
}
