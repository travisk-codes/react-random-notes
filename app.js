var AccidentalsInput = React.createClass({
  render: function() {
    return (
      <div id='accidentals-input-div'>
        <label htmlFor='accidentals-input'>ACCIDENTALS:</label>
        <input
          type='checkbox'
          id='accidentals-input'
          checked={ this.props.checked }
          onChange={ this.props.callback }
        />
      </div>
    );
  },
});

var BpmInput = React.createClass({
  render: function() {
    return (
      <div id='bpm-input-div'>
        <label htmlFor='bpm-input'>BPM:</label>
        <input
          type='number'
          id='bpm-input'
          value={ this.props.bpm }
          min='1'
          max='999'
          onChange={ this.props.callback }
        />
      </div>
    );
  }
});

var SoundInput = React.createClass({
  render: function() {
    return (
      <div id='sound-input-div'>
        <label htmlFor='sound-input'>SOUND:</label>
        <input
          type='checkbox'
          id='sound-input'
          checked={ this.props.checked }
          onChange={ this.props.callback }
        />
      </div>
    );
  },
});

var RandomNotes = React.createClass({

  ////// LIFECYCLE METHODS
  getInitialState: function() {
    return {
      accidental: '',
      accidentals: false,
      beat: 0,
      bpm: 120,
      note: '',
      sound: false,
    };
  },

  componentWillMount: function() {
    this.setState({
      beat: this.getNextBeat(),
      note: this.getRandomNote(),
    });
  },

  componentDidMount: function() {
    this.audio = React.findDOMNode(this.refs.tickSound);
    this.tickInterval = setInterval(this.tick, this.bpmToMs());
  },

  componentDidUpdate: function() {
    if (this.prevBpm !== this.state.bpm) {
      clearInterval(this.tickInterval);
      this.tickInterval = setInterval(this.tick, this.bpmToMs());
    }
  },

  componentWillUnmount: function() {
    clearInterval(this.tickInterval);
  },

  ////// SNOWFLAKE METHODS
  tick: function() { // called by componentDidMount, componentDidUpdate
    if (this.state.sound) { this.audio.play(); }

    this.setState(function(prevState) {
      var accidental = prevState.accidental;
      var beat = prevState.beat;
      var note = prevState.note;

      if (beat === 4) {
        note = this.getRandomNote();
        accidental = prevState.accidentals ? this.getRandomAccidental() : '';
      }
      beat = this.getNextBeat();

      return {
        accidental: accidental,
        beat: beat,
        note: note,
      }
    });
  },

  bpmToMs: function() { // called by componentDidMount, componentDidUpdate
    var milliseconds = 1 / ( this.state.bpm * (1/60000) );
        // ms / beat = 1 / (  beats / min  *  min / ms  )
    if (milliseconds <= 60000) { // if at least 1 bpm
      return milliseconds;
    } else {
      return 10000000; // a long time (pause the ticks)
    }
  },

  getRandomNote: function() { // called by componentWillMount, tick, self
    var notes = ['A','B','C','D','E','F','G'];
    var randomIndex = Math.floor( 7*Math.random() ); // int [0,6]
    var note = notes[randomIndex];

    // same note? let's try again!
    if (note === this.state.note) {
      note = this.getRandomNote();
    }

    return note;
  },

  getRandomAccidental: function() { // called by tick, self
    var accidentals = ['','♯','♭'];
    var randomIndex = Math.floor( 3*Math.random() ); // int [0,2]
    var accidental = accidentals[randomIndex];

    // same accidental? let's try again!
    if (accidental === this.state.accidental) {
      accidental = this.getRandomAccidental();
    }

    return accidental;
  },

  getNextBeat: function() { // called by componentWillMount, tick
    var nextBeat = this.state.beat + 1;
    if (nextBeat === 5) {
      return 1;
    }
    return nextBeat; // 1, 2, 3, 4, 1, ...
  },

  beatToDivs: function(beat) { // called by render
    var beatBoolArray = [0,0,0,0];
    beatBoolArray[beat-1] = true;
    beatDivs = beatBoolArray.map(function(currBeat) {
      return (
        <div
          className={ currBeat ? 'current beat' : 'beat' }
        />
      );
    });

    return beatDivs;
  },

  changeBpm: function(e) { // called by BpmInput.render
    this.prevBpm = this.state.bpm;
    this.setState( {bpm: e.target.value} );
  },

  changeAccidentals: function(e) { // called by AccidentalsInput.render
    this.setState( {accidentals: e.target.checked} );
  },

  changeSound: function(e) { // called by SoundInput.render
    this.setState( {sound: e.target.checked} );
  },

  ////// RENDER METHOD
  render: function() {
    beats = this.beatToDivs(this.state.beat);
    return (
      <div id='random-notes-container'>
        <div id='note-display'>
          { this.state.note }<sup>{ this.state.accidental }</sup>
        </div>
        <div id='beat-display'>
          { beats }
        </div>
        <div id='control-display'>
          <BpmInput
            bpm={ this.state.bpm }
            callback={ this.changeBpm }
          />
          <AccidentalsInput
            checked={ this.state.accidentals }
            callback={ this.changeAccidentals }
          />
          <SoundInput
            checked={ this.state.sound }
            callback={ this.changeSound }
          />
          <audio
            src='public/tick.ogg'
            ref='tickSound'
          ></audio>
        </div>
      </div>
    );
  },
});

React.render(
  <RandomNotes />,
  document.getElementById('container')
);
