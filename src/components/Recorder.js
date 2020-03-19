import React, { Component } from "react";
import { FaMicrophone } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import './../styles/style.scss'
const audioType = "audio/*";

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: {},
      seconds: 0,
      isPaused: false,
      recording: false,
      medianotFound: false,
      audios: []
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
    //if (this.timer === 0 && this.state.seconds > 0) {
    this.timer = setInterval(this.countDown, 1000);
    //}
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds + 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds
    });
  }

  secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds
    };
    return obj;
  }

  async componentDidMount() {
    console.log(navigator.mediaDevices);
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
    } else {
      this.setState({ medianotFound: true });
      console.log("Media Decives will work only with SSL.....");
    }
  }

  startRecording(e) {
    e.preventDefault();
    // wipe old data chunks
    this.chunks = [];
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
    this.mediaRecorder.stop();
    // say that we're not recording
    this.setState({ recording: false });
    // save the video to memory
    this.saveAudio();
  }

  saveAudio() {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, { type: audioType });
    // generate video url from blob
    const audioURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    const audios = [audioURL];
    this.setState({ audios });
    this.props.handleAudioStop({
      url: audioURL,
      blob: blob,
      chunks: this.chunks,
      duration: this.state.time
    });
  }

  render() {
    const { recording, audios, time, medianotFound, pauseRecord } = this.state;
    const { showUIAudio, title } = this.props;
    return (
      <div className="recorder-library-box">
        <div className="recorder-box">
          <div className="recorder-box-inner">
            <div className="reco-header">
              <h2>{title}</h2>
              <span className="close-icons">
                <FaTimes />
              </span>
            </div>
            {!medianotFound ? (
              <div className="record-section">
                <div className="duration-section">
                  <div className="audio-section">
                    {audios.length >= 1 && showUIAudio ? (
                      <audio controls>
                        <source src={audios[0]} type="audio/ogg" />
                        <source src={audios[0]} type="audio/mpeg" />
                      </audio>
                    ) : null}
                  </div>
                  <div className="duration">
                    <span className="mins">
                      {time.m !== undefined
                        ? `${time.m <= 9 ? "0" + time.m : time.m}`
                        : "00"}
                    </span>
                    <span className="divider">:</span>
                    <span className="secs">
                      {time.s !== undefined
                        ? `${time.s <= 9 ? "0" + time.s : time.s}`
                        : "00"}
                    </span>
                  </div>
                  {!recording ? (
                    <p className="help">Press the microphone to record</p>
                  ) : null}
                </div>
                {!recording ? (
                  <a
                    onClick={e => this.startRecording(e)}
                    href=" #"
                    className="mic-icon"
                  >
                    <FaMicrophone />
                  </a>
                ) : (
                  <div className="record-controller">
                    <a
                      onClick={e => this.stopRecording(e)}
                      href=" #"
                      className="icons stop"
                    >
                      <FaStop />
                    </a>
                    <a
                      onClick={
                        !pauseRecord
                          ? e => this.handleAudioPause(e)
                          : e => this.handleAudioStart(e)
                      }
                      href=" #"
                      className="icons pause"
                    >
                      {pauseRecord ? <FaPlay /> : <FaPause />}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#fff", marginTop: 30, fontSize: 25 }}>
                Seems the site is Non-SSL
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Recorder;
