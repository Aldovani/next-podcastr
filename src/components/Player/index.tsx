import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { usePlayer } from "../../contexts/PlayerContext";
import styles from "./styles.module.scss";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    currentEpisodeIndex,
    episodeList,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playPrevious,
    playNext,
    clearPlayerState,
    hasNext,
    hasPrevious,
  } = usePlayer();
  const episode = episodeList[currentEpisodeIndex];

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener("timeupdate", () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else if (hasNext) {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong> {episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ""}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                railStyle={{ backgroundColor: "#9F75FF" }}
                trackStyle={{ backgroundColor: "#04d361" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            ref={audioRef}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            src={episode.url}
            autoPlay
            onEnded={handleEpisodeEnded}
            onLoadedMetadata={setupProgressListener}
            loop={isLooping}
          />
        )}

        <div className={styles.buttons}>
          <button
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
            type="button"
            disabled={!episode || episodeList.length === 1}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button
            onClick={playPrevious}
            type="button"
            disabled={!episode || !hasPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>

          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Tocar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button
            onClick={playNext}
            type="button"
            disabled={!episode || !hasNext}
          >
            <img src="/play-next.svg" alt="Tocar proxima" />
          </button>
          <button
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
            type="button"
            disabled={!episode}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
