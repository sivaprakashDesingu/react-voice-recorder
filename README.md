[![NPM](https://img.shields.io/npm/v/react-select.svg)](https://www.npmjs.com/package/react-voice-recorder)

# react-voice-recorder

This (react-voice-recorder) is a JavaScript library for React Applicaiton which will be used to record voice as audio and download the same.

# Demo

Checkout the [Demo](https://library-demos.herokuapp.com/react-voice-recorder)

# Installation

```npm i react-voice-recorder```  //This will download the latest version of Module.

# Import in your project file

```
import {Recorder} from 'react-voice-recorder'
import 'react-voice-recorder/dist/index.css'
```

# Declare inside the render menthod


```
this.state = {
    audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: 0,
          m: 0,
          s: 0
        }
      }
}
handleAudioStop(data){
    console.log(data)
    this.setState({ audioDetails: data });
}

handleAudioUpload(file) {
    console.log(file);
}

handleCountDown(data) {
    console.log(data);
}

handleReset() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0
      }
    };
    this.setState({ audioDetails: reset });
  }

<Recorder
    record={true}
    title={"New recording"}
    audioURL={this.state.audioDetails.url}
    showUIAudio
    handleAudioStop={data => this.handleAudioStop(data)}
    handleAudioUpload={data => this.handleAudioUpload(data)}
    handleCountDown={data => this.handleCountDown(data)}
    handleReset={() => this.handleReset()}
    mimeTypeToUseWhenRecording={`audio/webm`} // For specific mimetype.
/>

```


## Props

Common props you may want to specify include:

- `record` - Flag 
- `title` - Title for the Model
- `hideHeader` - To hide the header which showing title
- `audioURL` - To hear what has been recorded.
- `showUIAudio` - Either need to show HTML5 audio tag after stopped or not.
- `handleAudioStop` - Once your are stop the record, this will send your the data to process. further
- `handleAudioUpload` - Onced click the upload button, Blob will be passed via props 
- `handleCountDown` - Transmits time every 100 milliseconds 
- `uploadButtonDisabled` *(optional)* - When set to true, the upload button is disabled 
- `mimeTypeToUseWhenRecording` *(optional)* - Specify the MIME type you want to use when recording. If none specified, the browser's default will be used.
  - `audio/ogg` for Firefox
  - `audio/webm` for Chrome

## License

MIT Licensed.