// js/core/MusicSystem.js

// Background music playback system
import { GameState } from './GameState.js';

export const MusicSystem = {
    // Audio instance
    audio: null,
    currentTrack: null,
    currentCategory: null,
    
    // Music configuration
    musicConfig: {
        opening: {
            tracks: ['assets/BGM/opening/opening.mp3'],
            volume: 0.3,
            loop: true,
        },
        all_scenes: {
            tracks: [
                'assets/BGM/all_scenes/scene1.mp3',
                'assets/BGM/all_scenes/scene2.mp3',
                'assets/BGM/all_scenes/scene3.mp3',
                'assets/BGM/all_scenes/scene4.mp3',
            ],
            volume: 0.3,
            loop: true,
        },
        accusation: {
            tracks: ['assets/BGM/accusation/accusation.mp3'],
            volume: 0.4,
            loop: true,
        },
        confession: {
            tracks: ['assets/BGM/confession/confession.mp3'],
            volume: 0.4,
            loop: true,
        },
        be: {
            tracks: ['assets/BGM/be/be.mp3'],
            volume: 0.3,
            loop: true,
        }
    },
    
    // Scene music mapping (to remember the randomly selected music for each scene)
    sceneMusicMap: {},
    
    init() {
        console.log('Initializing music system');
        
        // Create audio instance
        this.audio = new Audio();
        
        // Listen for events
        document.addEventListener('gamestart', () => this.playSceneMusic(GameState.currentScene));
        document.addEventListener('sceneChanged', (e) => this.playSceneMusic(e.detail.sceneId));
        document.addEventListener('accusationStarted', () => this.playAccusationMusic());
        document.addEventListener('gameEnded', (e) => this.playEndingMusic(e.detail.endingType));

        // Autoplay opening music when the page loads
        this.playOpeningMusic();
    },

    play(category, trackPath) {
        if (this.currentTrack === trackPath && this.audio && !this.audio.paused) {
            return;
        }

        console.log(`Playing music: category=${category}, track=${trackPath}`);

        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio = null;
        }

        this.currentTrack = trackPath;
        this.currentCategory = category;

        const config = this.musicConfig[category];
        if (!config) {
            console.warn(`Music category ${category} not found.`);
            return;
        }

        const audio = new Audio();
        this.audio = audio;
        audio.src = trackPath;
        audio.volume = config.volume || 0.3;
        audio.loop = config.loop !== undefined ? config.loop : true;

        audio.addEventListener('error', (e) => {
            if (audio.src === this.audio.src) {
                console.error(`Failed to load audio file: ${trackPath}`, e);
                this.playNextTrackInCategory(category);
            }
        });

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name === 'AbortError') {
                    console.log('Audio playback aborted by new request.');
                    return;
                }

                console.error('Music playback failed:', error);

                const unlockAudio = () => {
                    audio.play().then(() => {
                        console.log('Audio playback unlocked.');
                    }).catch(e => {
                        if (e.name !== 'AbortError') {
                            console.error('Failed to unlock audio:', e);
                        }
                    });
                    document.body.removeEventListener('click', unlockAudio);
                    document.body.removeEventListener('keydown', unlockAudio);
                };

                document.body.addEventListener('click', unlockAudio, { once: true });
                document.body.addEventListener('keydown', unlockAudio, { once: true });
                console.log('Audio playback requires user interaction. Click anywhere to start music.');
            });
        }
    },
    
    // Play opening music
    playOpeningMusic() {
        const category = 'opening';
        const trackPath = this.musicConfig[category].tracks[0];
        this.play(category, trackPath);
    },
    
    // Play scene music
    playSceneMusic(sceneId) {
        const category = 'all_scenes';
        let trackPath;

        if (this.sceneMusicMap[sceneId]) {
            // If music for this scene is already chosen, play it
            trackPath = this.sceneMusicMap[sceneId];
        } else {
            // Otherwise, select a random track for the scene
            const tracks = this.musicConfig[category].tracks;
            if (tracks.length > 0) {
                trackPath = tracks[Math.floor(Math.random() * tracks.length)];
                this.sceneMusicMap[sceneId] = trackPath; // Remember the choice
            }
        }

        if (trackPath) {
            this.play(category, trackPath);
        } else {
            console.warn('No tracks available for all_scenes category.');
        }
    },
    
    // Play accusation music
    playAccusationMusic() {
        const category = 'accusation';
        const trackPath = this.musicConfig[category].tracks[0];
        this.play(category, trackPath);
    },

    // Play ending music based on the result
    playEndingMusic(endingType) {
        let category;
        if (endingType === 'good' || endingType === 'perfect') {
            category = 'confession';
        } else {
            category = 'be'; // bad ending
        }
        const trackPath = this.musicConfig[category].tracks[0];
        this.play(category, trackPath);
    },
    
    // Play next track in the same category if available
    playNextTrackInCategory(category) {
        const config = this.musicConfig[category];
        if (!config || !config.tracks || config.tracks.length <= 1) {
            console.warn(`No alternative tracks available for category: ${category}`);
            return;
        }

        // Find current track index
        const currentIndex = config.tracks.indexOf(this.currentTrack);
        if (currentIndex === -1) {
            console.warn(`Current track not found in category: ${category}`);
            return;
        }

        // Select next track (loop back to first if at end)
        const nextIndex = (currentIndex + 1) % config.tracks.length;
        const nextTrack = config.tracks[nextIndex];
        
        // Avoid infinite loop if we only have one track
        if (nextTrack === this.currentTrack) {
            console.warn(`Only one track available for category: ${category}`);
            return;
        }

        console.log(`Trying next track in category ${category}: ${nextTrack}`);
        this.play(category, nextTrack);
    },
    
    stop() {
        this.audio.pause();
        this.audio.src = '';
        this.currentTrack = null;
        this.currentCategory = null;
    },
    
    setVolume(volume) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
    },
    
    toggleMute() {
        this.audio.muted = !this.audio.muted;
        return this.audio.muted;
    }
};

window.MusicSystem = MusicSystem;