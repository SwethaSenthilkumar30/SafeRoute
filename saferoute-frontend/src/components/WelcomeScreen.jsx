
import { useRef, useState } from 'react';
import './WelcomeScreen.css';

function WelcomeScreen({ onEnter }) {

    const audioRef = useRef(null);
    const [musicOn, setMusicOn] = useState(false);

    const toggleMusic = async () => {

        if (!audioRef.current) return;

        if (musicOn) {
            audioRef.current.pause();
            setMusicOn(false);
        } else {
            try {
                await audioRef.current.play();
                setMusicOn(true);
            } catch (error) {
                console.log('Unable to play music:', error);
            }
        }
    };

    return (
        <div className="welcome-screen">

            <video
                className="welcome-video"
                autoPlay
                muted
                loop
                playsInline
            >
                <source
                    src="/videos/welcome-travel.mp4"
                    type="video/mp4"
                />
            </video>

            <div className="welcome-overlay"></div>

            <audio
                ref={audioRef}
                src="/audio/welcome-music.mp3"
                loop
            />

            <div className="welcome-content">

                <div className="welcome-logo">
                    Safe<span>Route</span>
                </div>

                <p className="welcome-tagline">
                    YOUR JOURNEY. YOUR SAFETY.
                </p>

                <h1>
                    Every journey tells a story.
                    <br />
                    <span>Make yours a safe one.</span>
                </h1>

                <p className="welcome-description">
                    Discover new places, create beautiful memories
                    and travel with confidence.
                </p>

                <div className="welcome-actions">

                    <button
                        className="explore-btn"
                        onClick={onEnter}
                    >
                        Explore SafeRoute
                    </button>

                    <button
                        className="music-btn"
                        onClick={toggleMusic}
                    >
                        {musicOn ? '♫ Music On' : '♫ Music Off'}
                    </button>

                </div>

                <p className="welcome-footer">
                    TRAVEL SMART. STAY SAFE.
                </p>

            </div>

        </div>
    );
}

export default WelcomeScreen;
