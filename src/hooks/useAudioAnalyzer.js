import { useState, useEffect } from "react";

export default function useAudioAnalyzer(audioRef) {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(new Uint8Array(64));
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createMediaElementSource(audioRef.current);
    const analyserNode = context.createAnalyser();

    analyserNode.fftSize = 128;
    source.connect(analyserNode);
    analyserNode.connect(context.destination);

    setAudioContext(context);
    setAnalyser(analyserNode);

    const bufferLength = analyserNode.frequencyBinCount;
    const newArray = new Uint8Array(bufferLength);

    const tick = () => {
      analyserNode.getByteFrequencyData(newArray);
      setDataArray([...newArray]);
      requestAnimationFrame(tick);
    };
    tick();

    return () => {
      source.disconnect();
      analyserNode.disconnect();
    };
  }, [audioRef]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      audioContext?.resume();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return { dataArray, isPlaying, togglePlayback };
}
