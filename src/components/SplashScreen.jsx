import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
    const [text, setText] = useState('KYP');
    // phases: 'initial' (KYP), 'expanded' (Know Your Power), 'exit' (Fade Out)
    const [phase, setPhase] = useState('initial');
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // 1. Check for Reduced Motion / Session
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Comment out the next line to DEBUG animation on every reload
        const hasSeenSplash = sessionStorage.getItem('kyp_splash_seen');

        // Skip if needed
        if (prefersReducedMotion || hasSeenSplash) {
            onFinish();
            setShouldRender(false);
            return;
        }

        // 2. Mark as seen for this session
        sessionStorage.setItem('kyp_splash_seen', 'true');

        // 3. Animation Sequence
        // Step 2: Expansion (0.3s)
        const timer1 = setTimeout(() => {
            setText('Know Your Power');
            setPhase('expanded');
        }, 350);

        // Step 3: Exit (1.2s - Wait for reading)
        const timer2 = setTimeout(() => {
            setPhase('exit');
        }, 1250);

        // Step 4: Finish (1.6s - Allow fade out)
        const timer3 = setTimeout(() => {
            onFinish();
            setShouldRender(false);
        }, 1650);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onFinish]);

    if (!shouldRender) return null;

    return (
        <div className={`splash-screen ${phase}`}>
            <h1 className="splash-text">
                {text}
            </h1>
        </div>
    );
};

export default SplashScreen;
