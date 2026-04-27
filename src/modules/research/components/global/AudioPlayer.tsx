"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";
import { interviewApi } from "../../api/interviews.api";
import styles from "./AudioPlayer.module.css";

const createDummyAudio = () => {
  if (typeof Audio === "undefined") {
    return null;
  }
  try {
    return document.createElement("audio");
  } catch (err) {
    console.warn("[AudioPlayer] Failed to create test audio element:", err);
    return null;
  }
};

interface AudioPlayerProps {
  interviewId: string;
  audioPath?: string | null;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  interviewId,
  audioPath = null,
  autoPlay = false,
}) => {
  const t = useTranslations();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [, setCacheBuster] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [displayCurrentTime, setDisplayCurrentTime] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [oggSupported, setOggSupported] = useState(true);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isManualDownloading, setIsManualDownloading] = useState(false);
  const [manualDownloadProgress, setManualDownloadProgress] = useState(0);

  const evaluateOggSupport = useCallback(() => {
    const testAudio = createDummyAudio();
    if (!testAudio || typeof testAudio.canPlayType !== "function") {
      setOggSupported(false);
      return;
    }
    const opusSupport = testAudio.canPlayType('audio/ogg; codecs="opus"');
    const vorbisSupport = testAudio.canPlayType('audio/ogg; codecs="vorbis"');
    setOggSupported(Boolean(opusSupport || vorbisSupport));
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setReady(false);
    setDuration(0);
    setDisplayCurrentTime(0);
    setSeekValue(0);
    setIsPlaying(false);
    setError(null);
    setDownloadProgress(0);
    setBufferedEnd(0);
  }, []);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrl) {
      if (objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl(null);
    }
  }, [objectUrl]);

  const setupAudio = useCallback(
    async (url: string) => {
      const audio = audioElementRef.current;
      if (!audio) {
        console.warn(
          "[AudioPlayer] audio element not available for setup, will retry",
        );
        return false;
      }

      try {
        audio.pause();
        audio.src = url;
        audio.currentTime = 0;
        audio.load();

        if (autoPlay) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (autoPlayError) {
            console.warn("[AudioPlayer] Autoplay blocked:", autoPlayError);
          }
        }
        return true;
      } catch (err) {
        console.error("[AudioPlayer] setupAudio failed:", err);
        setError(t("audioPlayer.errors.loadFailed"));
        return false;
      }
    },
    [autoPlay, t],
  );

  const loadAudio = useCallback(async () => {
    if (!audioPath) {
      cleanupObjectUrl();
      resetState();
      return;
    }

    resetState();

    if (!oggSupported) {
      setError(t("audioPlayer.errors.formatNotSupported"));
      return;
    }

    setLoading(true);
    const currentCacheBuster = Date.now();
    setCacheBuster(currentCacheBuster);
    cleanupObjectUrl();

    let directUrl: string | null = null;
    try {
      const urlResponse = await interviewApi.getAudioUrl(interviewId);
      if (urlResponse.data && urlResponse.data.direct && urlResponse.data.url) {
        directUrl = urlResponse.data.url;
      }
    } catch (urlError: unknown) {
      console.log(
        "[AudioPlayer] Signed URL not available, using blob download",
        (urlError as Error)?.message,
      );
    }

    if (directUrl) {
      setObjectUrl(directUrl);
      setLoading(false);
      return;
    }

    try {
      const apiResponse = await interviewApi.downloadAudio(interviewId, {
        params: { cb: currentCacheBuster },
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setDownloadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          } else if (progressEvent.loaded) {
            setDownloadProgress((prev) => Math.min(90, prev + 5));
          }
        },
      });

      setDownloadProgress(100);

      const contentType: string =
        (typeof apiResponse.headers?.get === "function"
          ? apiResponse.headers.get("content-type")
          : apiResponse.headers?.["content-type"]) ?? "";

      if (!contentType.toLowerCase().includes("audio")) {
        console.warn("[AudioPlayer] Unexpected Content-Type:", contentType);
        setError(t("audioPlayer.errors.unexpectedType"));
        setLoading(false);
        return;
      }

      const blob = apiResponse.data;
      if (!(blob instanceof Blob)) {
        console.error("[AudioPlayer] API response did not return a Blob.");
        setError(t("audioPlayer.errors.invalidResponse"));
        setLoading(false);
        return;
      }

      const newObjectUrl = URL.createObjectURL(blob);
      setObjectUrl(newObjectUrl);
      setReady(false);
      setLoading(false);
    } catch (networkError: unknown) {
      console.error(
        "[AudioPlayer] Failed to fetch audio via API:",
        networkError,
      );
      if (
        networkError &&
        typeof networkError === "object" &&
        "response" in networkError
      ) {
        const errResponse = (
          networkError as {
            response: {
              status: unknown;
              statusText: unknown;
              data: Record<string, unknown> | null;
            };
          }
        ).response;
        const { status, statusText, data } = errResponse;
        const details =
          data && typeof data === "object" && "error" in data
            ? `: ${data.error}`
            : "";
        setError(
          t("audioPlayer.errors.serverError", {
            status: String(status),
            statusText: String(statusText),
            details,
          }),
        );
      } else {
        setError(t("audioPlayer.errors.fetchFailed"));
      }
      setLoading(false);
    }
  }, [audioPath, interviewId, oggSupported, t, cleanupObjectUrl, resetState]);

  // Handle objectUrl changes and ensure audio element is synced
  useEffect(() => {
    if (!objectUrl) return;

    let mounted = true;
    const attemptSetup = async (retries = 3) => {
      if (!mounted) return;

      const success = await setupAudio(objectUrl);
      if (!success && retries > 0 && mounted) {
        setTimeout(() => attemptSetup(retries - 1), 100);
      } else if (!success && retries === 0) {
        setError(t("audioPlayer.errors.playerNotReady"));
      }
    };

    attemptSetup();

    return () => {
      mounted = false;
    };
  }, [objectUrl, setupAudio, t]);

  const handleMetadata = () => {
    if (!audioElementRef.current) return;
    const audio = audioElementRef.current;
    const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
    setDuration(dur);
    setDisplayCurrentTime(0);
    setSeekValue(0);
    setVolume(audio.volume);
    setPreviousVolume(audio.volume);
    setLoading(false);
    setReady(true);
    setBufferedEnd(dur);
  };

  const handleReady = () => {
    setReady(true);
    if (duration > 0) {
      setBufferedEnd(duration);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioElementRef.current) return;
    setDisplayCurrentTime(audioElementRef.current.currentTime);
    setSeekValue(audioElementRef.current.currentTime);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setDisplayCurrentTime(duration);
    setSeekValue(duration);
  };

  const handleProgress = () => {
    if (!audioElementRef.current) return;
    const buffered = audioElementRef.current.buffered;
    if (buffered.length > 0) {
      setBufferedEnd(buffered.end(buffered.length - 1));
    }
  };

  const handleError = () => {
    const mediaError = audioElementRef.current?.error;
    setLoading(false);
    setReady(false);
    setIsPlaying(false);

    if (!mediaError) {
      setError(t("audioPlayer.errors.unknown"));
      return;
    }

    switch (mediaError.code) {
      case mediaError.MEDIA_ERR_ABORTED:
        setError(t("audioPlayer.errors.aborted"));
        break;
      case mediaError.MEDIA_ERR_NETWORK:
        setError(t("audioPlayer.errors.network"));
        break;
      case mediaError.MEDIA_ERR_DECODE:
        setError(t("audioPlayer.errors.decode"));
        break;
      case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      default:
        setError(t("audioPlayer.errors.srcNotSupported"));
    }
  };

  const bufferBarStyle = useMemo(() => {
    const bufferPercent = loading
      ? downloadProgress
      : duration > 0
        ? Math.min(100, (bufferedEnd / duration) * 100)
        : 0;
    return { width: `${bufferPercent}%` };
  }, [loading, downloadProgress, duration, bufferedEnd]);

  const timelineStyle = useMemo(() => {
    if (!duration || !Number.isFinite(duration) || duration <= 0) {
      return {};
    }
    const percentage = Math.min(100, Math.max(0, (seekValue / duration) * 100));
    return {
      background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percentage}%, transparent ${percentage}%, transparent 100%)`,
    };
  }, [duration, seekValue]);

  const togglePlayback = async () => {
    if (!audioElementRef.current || !ready) return;
    if (audioElementRef.current.paused) {
      try {
        await audioElementRef.current.play();
      } catch (playError) {
        console.error("[AudioPlayer] play() failed:", playError);
        setError(t("audioPlayer.errors.playFailed"));
      }
    } else {
      audioElementRef.current.pause();
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElementRef.current || !ready) return;
    const newTime = Number(event.target.value);
    audioElementRef.current.currentTime = newTime;
    setDisplayCurrentTime(newTime);
    setSeekValue(newTime);
  };

  const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElementRef.current) return;
    const newVolume = Number(event.target.value);
    audioElementRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (!audioElementRef.current) return;
    if (isMuted || audioElementRef.current.volume === 0) {
      const restoreVolume = previousVolume > 0 ? previousVolume : 0.6;
      audioElementRef.current.volume = restoreVolume;
      setVolume(restoreVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(audioElementRef.current.volume);
      audioElementRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const downloadAudioAction = async () => {
    if (!audioPath || isManualDownloading) return;
    setIsManualDownloading(true);
    setManualDownloadProgress(0);
    try {
      const response = await interviewApi.downloadAudio(interviewId, {
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setManualDownloadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          } else if (progressEvent.loaded) {
            setManualDownloadProgress((prev) => Math.min(95, prev + 5));
          }
        },
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename =
        (audioPath && audioPath.split("/").pop()) || `${interviewId}.ogg`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("[AudioPlayer] Failed to download audio:", downloadError);
      setError(t("audioPlayer.errors.downloadFailed"));
    } finally {
      setIsManualDownloading(false);
      setManualDownloadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    evaluateOggSupport();
  }, [evaluateOggSupport]);

  useEffect(() => {
    loadAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPath]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const audio = audioElementRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      cleanupObjectUrl();
    };
  }, [cleanupObjectUrl]);

  return (
    <div
      className={`${styles.audioPlayer} ${
        !audioPath ? styles.audioPlayerDisabled : ""
      }`}
    >
      {/*
        The <audio> element is ALWAYS rendered so audioElementRef.current
        is available immediately - this prevents the "playerNotReady" race
        condition where setupAudioBlob fires before React commits the DOM.
      */}
      <audio
        ref={audioElementRef}
        preload="metadata"
        className={styles.audioElement}
        onLoadedMetadata={handleMetadata}
        onLoadedData={handleReady}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        onProgress={handleProgress}
        style={{ display: "none" }}
      >
        {t("audioPlayer.browserNotSupported")}
      </audio>

      {!audioPath ? (
        <div className={styles.audioState}>
          <span className={styles.audioStateIcon}>⏳</span>
          <div className={styles.audioStateText}>
            <strong>{t("audioPlayer.processing")}</strong>
            <p>{t("audioPlayer.processingHint")}</p>
          </div>
        </div>
      ) : !oggSupported ? (
        <div className={styles.audioWarning}>
          <strong>{t("audioPlayer.unsupportedFormat")}</strong>
          <p>{t("audioPlayer.unsupportedHint")}</p>
          <button
            className={`${styles.audioButton} ${styles.audioButtonGhost}`}
            onClick={downloadAudioAction}
          >
            {t("audioPlayer.downloadFile")}
          </button>
        </div>
      ) : (
        <div className={styles.audioShell}>
          <div
            className={`${styles.audioControls} ${
              !ready || loading ? styles.audioControlsLoading : ""
            }`}
          >
            <button
              className={`${styles.audioButton} ${styles.audioButtonPrimary}`}
              disabled={!ready || !!error || loading}
              onClick={togglePlayback}
            >
              {loading ? (
                <span className={styles.spinnerSmall} style={{ margin: 0 }}></span>
              ) : isPlaying ? (
                <span aria-label={t("audioPlayer.pause")}>⏸</span>
              ) : (
                <span aria-label={t("audioPlayer.play")}>▶</span>
              )}
            </button>

            <div className={styles.audioTimeline}>
              <div className={styles.audioTime}>
                <span>
                  {loading
                    ? t("audioPlayer.loading")
                    : formatTime(displayCurrentTime)}
                </span>
                <span>
                  {loading
                    ? downloadProgress > 0
                      ? `${downloadProgress}%`
                      : "..."
                    : formatTime(duration)}
                </span>
              </div>
              <div
                className={styles.audioProgressContainer}
                data-testid="audio-progress-container"
              >
                <div
                  className={styles.audioBufferBar}
                  data-testid="audio-buffer-bar"
                  style={bufferBarStyle}
                ></div>
                <input
                  className={`${styles.audioSlider} ${styles.audioSliderTimeline}`}
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={seekValue}
                  disabled={!ready || !!error || loading}
                  style={timelineStyle}
                  onChange={handleSeek}
                />
              </div>
            </div>

            <div className={styles.audioSecondary}>
              <div className={styles.audioVolume}>
                <button
                  className={`${styles.audioButton} ${styles.audioButtonGhost} ${styles.audioButtonMute}`}
                  disabled={!ready || !!error || loading}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <span aria-label={t("audioPlayer.unmute")}>🔇</span>
                  ) : volume <= 0.3 ? (
                    <span aria-label={t("audioPlayer.volumeLow")}>🔈</span>
                  ) : volume <= 0.7 ? (
                    <span aria-label={t("audioPlayer.volumeMedium")}>🔉</span>
                  ) : (
                    <span aria-label={t("audioPlayer.mute")}>🔊</span>
                  )}
                </button>
                <input
                  className={`${styles.audioSlider} ${styles.audioSliderVolume}`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  disabled={!ready || !!error || loading}
                  onChange={handleVolume}
                />
              </div>

              <button
                className={`${styles.audioButton} ${styles.audioButtonGhost} ${
                  isManualDownloading ? styles.audioButtonDownloading : ""
                }`}
                onClick={downloadAudioAction}
                disabled={isManualDownloading || (loading && !ready)}
                style={
                  isManualDownloading
                    ? {
                        background: `linear-gradient(to right, rgba(37, 99, 235, 0.1) ${manualDownloadProgress}%, transparent ${manualDownloadProgress}%)`,
                      }
                    : {}
                }
              >
                {isManualDownloading ? (
                  <>
                    <span className={styles.spinnerSmall}></span>
                    {t("audioPlayer.downloading")} ({manualDownloadProgress}%)
                  </>
                ) : (
                  <>⬇️ {t("audioPlayer.download")}</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.audioError}>
              <strong>{t("audioPlayer.playbackError")}</strong>
              <p>{error}</p>
              <button
                className={`${styles.audioButton} ${styles.audioButtonGhost}`}
                onClick={downloadAudioAction}
              >
                {t("audioPlayer.downloadFile")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
