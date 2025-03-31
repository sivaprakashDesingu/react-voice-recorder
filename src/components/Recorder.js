import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from '../styles.module.css';

const audioType = 'audio/*';

const Recorder = ({
  hideHeader = false,
  mimeTypeToUseWhenRecording = null,
  handleCountDown = () => {},
  handleAudioStop,
  handleAudioUpload,
  handleReset,
  showUIAudio,
  title,
  audioURL,
  disableFullUI,
  uploadButtonDisabled
}) => {
  const [time, setTime] = useState({});
  const [miliseconds, setMiliseconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [isRecordingStopped, setIsRecordingStopped] = useState(false);
  const [medianotFound, setMedianotFound] = useState(false);
  const [audios, setAudios] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [pauseRecord, setPauseRecord] = useState(false);
  const chunks = useRef([]);
  const mediaRecorder = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    timer.current = setInterval(countDown, 100);
  }, []);

  const countDown = useCallback(() => {
    setMiliseconds(prevMiliseconds => {
      const newMiliseconds = prevMiliseconds + 100;
      const newTime = milisecondsToTime(newMiliseconds);
      setTime(newTime);
      handleCountDown(newTime);
      return newMiliseconds;
    });
  }, [handleCountDown]);

  const milisecondsToTime = useCallback((milisecs) => {
    let secs = milisecs / 1000;
    let hours = Math.floor(secs / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    return {
      h: hours,
      m: minutes,
      s: seconds,
      ms: milisecs
    };
  }, []);

  const initRecorder = useCallback(async () => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (navigator.mediaDevices) {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream.current, { mimeType: mimeTypeToUseWhenRecording || undefined });
      mediaRecorder.current.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
    } else {
      setMedianotFound(true);
      console.log('Media Devices will work only with SSL.....');
    }
  }, [mimeTypeToUseWhenRecording]);

  const startRecording = useCallback(async (e) => {
    e.preventDefault();
    chunks.current = [];
    await initRecorder();
    mediaRecorder.current.start(10);
    startTimer();
    setRecording(true);
  }, [initRecorder, startTimer]);

  const stopRecording = useCallback((e) => {
    e.preventDefault();
    clearInterval(timer.current);
    setTime({});

    if (stream.current.getAudioTracks) {
      const tracks = stream.current.getAudioTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    } else {
      console.log('No Tracks Found');
    }

    mediaRecorder.current.stop();
    setRecording(false);
    setIsRecordingStopped(true);
    setPauseRecord(false);
    saveAudio();
  }, [saveAudio]);

  const handleAudioPause = useCallback((e) => {
    e.preventDefault();
    clearInterval(timer.current);
    mediaRecorder.current.pause();
    setPauseRecord(true);
  }, []);

  const handleAudioStart = useCallback((e) => {
    e.preventDefault();
    startTimer();
    mediaRecorder.current.resume();
    setPauseRecord(false);
  }, [startTimer]);

  const handleResetClick = useCallback((e) => {
    if (recording) {
      stopRecording(e);
    }
    setIsRecordingStopped(false);
    setTime({});
    setMiliseconds(0);
    setRecording(false);
    setMedianotFound(false);
    setAudios([]);
    setAudioBlob(null);
    handleReset();
  }, [handleReset, recording, stopRecording]);

  const saveAudio = useCallback(() => {
    const blob = new Blob(chunks.current, { type: audioType });
    const audioURL = window.URL.createObjectURL(blob);
    setAudios([audioURL]);
    setAudioBlob(blob);
    handleAudioStop({
      url: audioURL,
      blob: blob,
      chunks: chunks.current,
      duration: time
    });
  }, [handleAudioStop, time]);

  if (disableFullUI) {
    return null;
  }

  return (
    <div className={styles.recorder_library_box}>
      <div className={styles.recorder_box}>
        <div className={styles.recorder_box_inner}>
          {!hideHeader && (
            <div className={styles.reco_header}>
              <h2 className={styles.h2}>{title}</h2>
              <span className={styles.close_icons}></span>
            </div>
          )}
          {!medianotFound ? (
            <div className={styles.record_section}>
              <div className={styles.btn_wrapper}>
                <button
                  onClick={() => handleAudioUpload(audioBlob)}
                  className={`${styles.btn} ${styles.upload_btn}`}
                  disabled={uploadButtonDisabled}
                >
                  Upload
                </button>
                <button
                  onClick={handleResetClick}
                  className={`${styles.btn} ${styles.clear_btn}`}
                >
                  Clear
                </button>
              </div>
              <div className={styles.duration_section}>
                <div className={styles.audio_section}>
                  {audioURL !== null && showUIAudio && (
                    <audio controls>
                      <source src={audios[0]} type='audio/ogg' />
                      <source src={audios[0]} type='audio/mpeg' />
                    </audio>
                  )}
                </div>
                <div className={styles.duration}>
                  <span className={styles.mins}>
                    {time.m !== undefined ? `${time.m <= 9 ? '0' + time.m : time.m}` : '00'}
                  </span>
                  <span className={styles.divider}>:</span>
                  <span className={styles.secs}>
                    {time.s !== undefined ? `${time.s <= 9 ? '0' + time.s : time.s}` : '00'}
                  </span>
                </div>
                {!recording && <p className={styles.help}>Press the microphone to record</p>}
              </div>
              {!recording && !isRecordingStopped ? (
                <a
                  onClick={startRecording}
                  href=' #'
                  className={styles.mic_icon}
                >
                  <span className={styles.microphone_icon_sec}>
                    <svg className={styles.mic_icon_svg} version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 1000 1000' enableBackground='new 0 0 1000 1000'>
                      <g>
                        <path d='M500,683.8c84.6,0,153.1-68.6,153.1-153.1V163.1C653.1,78.6,584.6,10,500,10c-84.6,0-153.1,68.6-153.1,153.1v367.5C346.9,615.2,415.4,683.8,500,683.8z M714.4,438.8v91.9C714.4,649,618.4,745,500,745c-118.4,0-214.4-96-214.4-214.4v-91.9h-61.3v91.9c0,141.9,107.2,258.7,245,273.9v124.2H346.9V990h306.3v-61.3H530.6V804.5c137.8-15.2,245-132.1,245-273.9v-91.9H714.4z' />
                      </g>
                    </svg>
                  </span>
                </a>
              ) : !isRecordingStopped ? (
                <div className={styles.record_controller}>
                  <a
                    onClick={stopRecording}
                    href=' #'
                    className={`${styles.icons} ${styles.stop}`}
                  >
                    <span className={styles.stop_icon}></span>
                  </a>
                  <a
                    onClick={!pauseRecord ? handleAudioPause : handleAudioStart}
                    href=' #'
                    className={`${styles.icons} ${styles.pause}`}
                  >
                    {pauseRecord ? <span className={styles.play_icons}></span> : <span className={styles.pause_icons}></span>}
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <p style={{ color: '#fff', marginTop: 30, fontSize: 25 }}>
              Seems the site is Non-SSL
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recorder;