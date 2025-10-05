import { useEffect, useRef, useState } from "react";

export default function useAudioAnalyzer(audioRef) {
  const [reactivity, setReactivity] = useState(0);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (!audioRef?.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audioRef.current);
    const analyzer = audioCtx.createAnalyser();

    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyzer);
    analyzer.connect(audioCtx.destination);

    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const update = () => {
      if (!analyzerRef.current) return;
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

      // Average the frequency data to get overall intensity
      const avg =
        dataArrayRef.current.reduce((a, b) => a + b, 0) /
        dataArrayRef.current.length;
      setReactivity(avg / 255); // normalize between 0–1

      requestAnimationFrame(update);
    };

    update();

    return () => {
      analyzer.disconnect();
      source.disconnect();
      audioCtx.close();
    };
  }, [audioRef]);

  return reactivity;
}
