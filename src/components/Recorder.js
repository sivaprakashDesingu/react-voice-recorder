import React, { Component } from 'react';
import microphone from './../imgs/microphone.svg';
import stopIcon from './../imgs/stop.png';
import pauseIcons from './../imgs/pause.png';
import playIcons from './../imgs/play-button.png';
import closeIcons from './../imgs/close.png';
import styles from '../styles.module.css';
const audioType = 'audio/*';

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: {},
      miliseconds: 0,
      recording: false,
      medianotFound: false,
      audios: [],
      audioBlob: null,
      stream: null
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  handleAudioPause(e) {
    e.preventDefault();
    clearInterval(this.timer);
    this.mediaRecorder.pause();
    this.setState({ pauseRecord: true });
  }

  handleAudioStart(e) {
    e.preventDefault();
    this.startTimer();
    this.mediaRecorder.resume();
    this.setState({ pauseRecord: false });
  }

  startTimer() {
    // if (this.timer === 0 && this.state.seconds > 0) {
    this.timer = setInterval(this.countDown, 100);
    // }
  }

  countDown() {
    // Remove one second, set state so a re-render happens.

    this.setState(prevState => {
      const miliseconds = prevState.miliseconds + 100;
      return ({ time: this.milisecondsToTime(miliseconds), miliseconds: miliseconds });
    });

    this.props.handleCountDown(this.state.time);
  }

  milisecondsToTime(milisecs) {

    let secs = milisecs / 1000;
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);


    let obj = {
      h: hours,
      m: minutes,
      s: seconds,
      ms: milisecs
    };
    return obj;
  }

  async initRecorder() {
    navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
    if (navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (this.props.mimeTypeToUseWhenRecording) {
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: this.props.mimeTypeToUseWhenRecording });
      } else {
        this.mediaRecorder = new MediaRecorder(stream);
      }
      this.chunks = [];
      this.mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.stream = stream;
    } else {
      this.setState({ medianotFound: true });
      console.log('Media Decives will work only with SSL.....');
    }
  }

  async startRecording(e) {
    e.preventDefault();
    // wipe old data chunks
    this.chunks = [];

    await this.initRecorder();
    // start recorder with 10ms buffer
    this.mediaRecorder.start(10);
    this.startTimer();
    // say that we're recording
    this.setState({ recording: true });
  }

  stopRecording(e) {
    clearInterval(this.timer);
    this.setState({ time: {} });
    e.preventDefault();
    // stop the recorder

    if (this.stream.getAudioTracks) {
      const tracks = this.stream.getAudioTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    } else {
      console.log('No Tracks Found')
    }

    this.mediaRecorder.stop();

    // say that we're not recording
    this.setState({ recording: false, pauseRecord: false, });
    // save the video to memory
    this.saveAudio();
  }

  handleReset(e) {
    if (this.state.recording) {
      this.stopRecording(e);
    }
    this.setState({
      time: {},
      miliseconds: 0,
      recording: false,
      medianotFound: false,
      audios: [],
      audioBlob: null
    }, () => {

      this.props.handleReset(this.state);
    });

  }

  saveAudio() {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, { type: audioType });
    // generate video url from blob
    const audioURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    const audios = [audioURL];
    this.setState({ audios, audioBlob: blob });
    this.props.handleAudioStop({
      url: audioURL,
      blob: blob,
      chunks: this.chunks,
      duration: this.state.time
    });
  }

  render() {
    const { recording, audios, time, medianotFound, pauseRecord } = this.state;
    const { showUIAudio, title, audioURL, disableFullUI } = this.props;

    if (disableFullUI) { return null; }

    return (
      <div className={styles.recorder_library_box}>
        <div className={styles.recorder_box}>
          <div className={styles.recorder_box_inner}>
            {
              !this.props.hideHeader ?
                <div className={styles.reco_header}>
                  <h2 className={styles.h2}>{title}</h2>
                  <span className={styles.close_icons}>
                  </span>
                </div> :
                null
            }
            {
              !medianotFound ?
                (
                  <div className={styles.record_section}>
                    <div className={styles.btn_wrapper}>
                      <button
                        onClick={
                          () =>
                            this.props.handleAudioUpload(this.state.audioBlob)
                        }
                        className={`${styles.btn} ${styles.upload_btn}`}
                        disabled={this.props.uploadButtonDisabled}
                      >
                    Upload
                      </button>
                      <button
                        onClick={(e) => this.handleReset(e)}
                        className={`${styles.btn} ${styles.clear_btn}`}
                      >
                    Clear
                      </button>
                    </div>
                    <div className={styles.duration_section}>
                      <div className={styles.audio_section}>
                        {
                          audioURL !== null && showUIAudio ?
                            (
                              <audio controls>
                                <source src={audios[0]} type='audio/ogg' />
                                <source src={audios[0]} type='audio/mpeg' />
                              </audio>
                            ) :
                            null
                        }
                      </div>
                      <div className={styles.duration}>
                        <span className={styles.mins}>
                          {
                            time.m !== undefined ?
                              `${time.m <= 9 ? '0' + time.m : time.m}` :
                              '00'
                          }
                        </span>
                        <span className={styles.divider}>:</span>
                        <span className={styles.secs}>
                          {
                            time.s !== undefined ?
                              `${time.s <= 9 ? '0' + time.s : time.s}` :
                              '00'
                          }
                        </span>
                      </div>
                      {
                        !recording ?
                          (
                            <p className={styles.help}>Press the microphone to record</p>
                          ) :
                          null
                      }
                    </div>
                    {
                      !recording ?
                        (
                          <a
                            onClick={e => this.startRecording(e)}
                            href=' #'
                            className={styles.mic_icon}
                          >
                            {/* <img src={microphone} width={30} height={30} alt="Microphone icons" /> */}
                            <span className={styles.microphone_icon_sec}>
                              <svg className={styles.mic_icon_svg} version='1.1' xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' viewBox='0 0 1000 1000' enableBackground='new 0 0 1000 1000' >
                                <g>
                                  <path d='M500,683.8c84.6,0,153.1-68.6,153.1-153.1V163.1C653.1,78.6,584.6,10,500,10c-84.6,0-153.1,68.6-153.1,153.1v367.5C346.9,615.2,415.4,683.8,500,683.8z M714.4,438.8v91.9C714.4,649,618.4,745,500,745c-118.4,0-214.4-96-214.4-214.4v-91.9h-61.3v91.9c0,141.9,107.2,258.7,245,273.9v124.2H346.9V990h306.3v-61.3H530.6V804.5c137.8-15.2,245-132.1,245-273.9v-91.9H714.4z' />
                                </g>
                              </svg>

                            </span>
                          </a>
                        ) :
                        (
                          <div className={styles.record_controller}>
                            <a
                              onClick={e => this.stopRecording(e)}
                              href=' #'
                              className={`${styles.icons} ${styles.stop}`}
                            >
                              <span className={styles.stop_icon}></span>
                              {/* <img src={stopIcon} width={20} height={20} alt="Stop icons" /> */}

                              {/* <span className={`${styles.icons} ${styles.FaStop}`}></span> */}
                            </a>
                            <a
                              onClick={
                                !pauseRecord ?
                                  e => this.handleAudioPause(e) :
                                  e => this.handleAudioStart(e)
                              }
                              href=' #'
                              className={`${styles.icons} ${styles.pause}`}
                            >
                              {
                                pauseRecord ?
                                  <span className={styles.play_icons}></span> :
                                  <span className={styles.pause_icons}></span>
                              }
                            </a>
                          </div>
                        )
                    }
                  </div>
                ) :
                (
                  <p style={{ color: '#fff', marginTop: 30, fontSize: 25 }}>
                  Seems the site is Non-SSL
                  </p>
                )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Recorder;

Recorder.defaultProps = {
  hideHeader: false,
  mimeTypeToUseWhenRecording: null,
  handleCountDown: (data) => {},
}
