"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface LetterState {
  char: string;
  isMatrix: boolean;
  isSpace: boolean;
}

interface MatrixTextProps {
  text?: string;
  className?: string;
  initialDelay?: number;
  letterAnimationDuration?: number;
  letterInterval?: number;
  /** Интервал повтора анимации в мс (0 = без повтора). */
  repeatInterval?: number;
}

const initialLetters = (text: string): LetterState[] =>
  text.split("").map((char) => ({
    char,
    isMatrix: false,
    isSpace: char === " ",
  }));

// Цвета проекта: мятный #00FFAA для фазы «матрицы»
const MATRIX_COLOR = "#00FFAA";
const MATRIX_SHADOW = "0 2px 8px rgba(0, 255, 170, 0.5)";

export function MatrixText({
  text = "HelloWorld!",
  className,
  initialDelay = 200,
  letterAnimationDuration = 500,
  letterInterval = 100,
  repeatInterval = 5000,
}: MatrixTextProps) {
  const [letters, setLetters] = useState<LetterState[]>(() => initialLetters(text));
  const [isAnimating, setIsAnimating] = useState(false);
  const repeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimatingRef = useRef(false);

  const getRandomChar = useCallback(() => (Math.random() > 0.5 ? "1" : "0"), []);

  const animateLetter = useCallback(
    (index: number) => {
      if (index >= text.length) return;

      requestAnimationFrame(() => {
        setLetters((prev) => {
          const next = [...prev];
          if (!next[index].isSpace) {
            next[index] = {
              ...next[index],
              char: getRandomChar(),
              isMatrix: true,
            };
          }
          return next;
        });

        setTimeout(() => {
          setLetters((prev) => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              char: text[index],
              isMatrix: false,
            };
            return next;
          });
        }, letterAnimationDuration);
      });
    },
    [getRandomChar, text, letterAnimationDuration]
  );

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    let currentIndex = 0;

    const animate = () => {
      if (currentIndex >= text.length) {
        isAnimatingRef.current = false;
        setIsAnimating(false);
        if (repeatInterval > 0) {
          repeatTimeoutRef.current = setTimeout(() => {
            setLetters(initialLetters(text));
            isAnimatingRef.current = false;
            startAnimation();
          }, repeatInterval);
        }
        return;
      }

      animateLetter(currentIndex);
      currentIndex++;
      setTimeout(animate, letterInterval);
    };

    animate();
  }, [animateLetter, text, letterInterval, repeatInterval]);

  useEffect(() => {
    const timer = setTimeout(startAnimation, initialDelay);
    return () => {
      clearTimeout(timer);
      if (repeatTimeoutRef.current) clearTimeout(repeatTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setLetters(initialLetters(text));
  }, [text]);

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center justify-center",
        className
      )}
      aria-label="Matrix text animation"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${index}-${letter.char}`}
          className="font-mono text-4xl md:text-6xl font-bold w-[1ch] text-center overflow-hidden inline-block"
          initial="initial"
          animate={letter.isMatrix ? "matrix" : "normal"}
          variants={{
            matrix: {
              color: MATRIX_COLOR,
              textShadow: MATRIX_SHADOW,
            },
            normal: {},
          }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {letter.isSpace ? "\u00A0" : letter.char}
        </motion.span>
      ))}
    </div>
  );
}
