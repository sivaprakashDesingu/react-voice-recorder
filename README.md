[![NPM](https://img.shields.io/npm/v/react-select.svg)](https://www.npmjs.com/package/react-voice-recorder)

# react-voice-recorder

This (react-voice-recorder) is a JavaScript library for React Applicaiton which will be used to record voice as audio and download the same.

# Demo

Checkout the [Demo](hhttps://codesandbox.io/s/cool-elbakyan-1hx5z)

# Installation

```npm i react-voice-recorder```  //This will download the latest version of Module.

# Import in your project file

```import {Recorder} from 'react-voice-recorder'```

# Declare inside the render menthod


```
handleAudioStop(data){
    console.log(data)
}
handleAudioUpload(file) {
    console.log(file);
  }
handleRest() {
    this.setState({ audioURL: null });
}
<Recorder
    record={true}
    title={"New recording"}
    audioURL={this.state.audioURL}
    showUIAudio
    handleAudioStop={data => this.handleAudioStop(data)}
    handleAudioUpload={data => this.handleAudioUpload(data)}
    handleRest={() => this.handleRest()}    
/>

```


## Props

Common props you may want to specify include:

- `record` - Flag 
- `title` - Title for the Model
- `showUIAudio` - Either need to show HTML5 audio tag after stopped or not.
- `handleAudioStop` - Once your are stop the record, this will send your the data to process. further


## License

MIT Licensed.