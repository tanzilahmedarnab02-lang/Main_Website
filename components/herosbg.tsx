import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;

function getFramePath(index: number): string {
    const padded = String(index).padStart(3, '0');
    return `ui/assets/ezgif-frame-${padded}.jpg`;
}

function preloadImages(onProgress?: (loaded: number, total: number) => void): Promise<HTMLImageElement[]> {
    return new Promise((resolve) => {
        const images: HTMLImageElement[] = new Array(FRAME_COUNT);
        let loadedCount = 0;

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.onload = img.onerror = () => {
                loadedCount++;
                images[i - 1] = img;
                onProgress?.(loadedCount, FRAME_COUNT);
                if (loadedCount === FRAME_COUNT) {
                    resolve(images);
                }
            };
            img.src = getFramePath(i);
        }
    });
}

export default function HeroSbg() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    const drawFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const images = imagesRef.current;
        if (!canvas || !ctx || !images[index]) return;

        const img = images[index];
        const canvasW = canvas.width;
        const canvasH = canvas.height;
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;

        if (imgW === 0 || imgH === 0) return;

        ctx.clearRect(0, 0, canvasW, canvasH);

        const canvasRatio = canvasW / canvasH;
        const imgRatio = imgW / imgH;

        let drawW: number, drawH: number, drawX: number, drawY: number;

        if (imgRatio > canvasRatio) {
            drawH = canvasH;
            drawW = canvasH * imgRatio;
            drawX = (canvasW - drawW) / 2;
            drawY = 0;
        } else {
            drawW = canvasW;
            drawH = canvasW / imgRatio;
            drawX = 0;
            drawY = (canvasH - drawH) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }, []);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        const currentFrame = imagesRef.current.length > 0
            ? Math.round(gsap.getProperty(containerRef.current, '--frame') as number || 0)
            : 0;
        if (imagesRef.current[currentFrame]) {
            drawFrame(currentFrame);
        }
    }, [drawFrame]);

    useEffect(() => {
        preloadImages((loaded, total) => {
            setLoadProgress(Math.round((loaded / total) * 100));
        }).then((images) => {
            imagesRef.current = images;
            setLoaded(true);
            resizeCanvas();
            if (images[0]) {
                drawFrame(0);
            }
        });

        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas, drawFrame]);

    useEffect(() => {
        if (!loaded || !containerRef.current || !canvasRef.current) return;

        const proxy = { frame: 0 };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                end: '+=400%',
                pin: true,
                scrub: 2,
                onUpdate: (self) => {
                    const frame = Math.round(self.progress * (FRAME_COUNT - 1));
                    if (frame >= 0 && frame < FRAME_COUNT && imagesRef.current[frame]) {
                        drawFrame(frame);
                    }
                },
            },
        });

        tl.fromTo(
            proxy,
            { frame: 0 },
            {
                frame: FRAME_COUNT - 1,
                ease: 'none',
                onUpdate: () => {
                    const frame = Math.round(proxy.frame);
                    if (frame >= 0 && frame < FRAME_COUNT && imagesRef.current[frame]) {
                        drawFrame(frame);
                    }
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach((st) => {
                if (st.trigger === containerRef.current) {
                    st.kill();
                }
            });
        };
    }, [loaded, drawFrame]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                background: '#000',
            }}
        >
            <canvas
                ref={canvasRef}
                id="hero-canvas"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 1s ease',
                }}
            />

            {!loaded && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#000',
                        zIndex: 5,
                    }}
                >
                    <div
                        style={{
                            width: '200px',
                            height: '2px',
                            background: 'rgba(224, 169, 197, 0.15)',
                            borderRadius: '1px',
                            overflow: 'hidden',
                            marginBottom: '16px',
                        }}
                    >
                        <div
                            style={{
                                width: `${loadProgress}%`,
                                height: '100%',
                                background: '#E0A9C5',
                                transition: 'width 0.2s ease',
                                borderRadius: '1px',
                            }}
                        />
                    </div>
                    <span
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: 'rgba(224, 169, 197, 0.5)',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {loadProgress}%
                    </span>
                </div>
            )}
        </div>
    );
}
