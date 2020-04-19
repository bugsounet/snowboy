/** Snowboy library **/
/** bugsounet **/

const path = require("path")
const Detector = require("../lib/node/index.js").Detector
const Models = require("../lib/node/index.js").Models
const Recorder = require("../resources/lpcm16.js")

var snowboyDict = {
  "smart_mirror": {
    hotwords: "smart_mirror",
    file: "smart_mirror.umdl",
    sensitivity: "0.5",
  },
  "computer": {
    hotwords: "computer",
    file: "computer.umdl",
    sensitivity: "0.6",
  },
  "snowboy": {
    hotwords: "snowboy",
    file: "snowboy.umdl",
    sensitivity: "0.5",
  },
  "jarvis": {
    hotwords: ["jarvis", "jarvis"],
    file: "jarvis.umdl",
    sensitivity: "0.7,0.7",
  },
  "subex": {
    hotwords: "subex",
    file: "subex.umdl",
    sensitivity: "0.6",
  },
  "neo_ya": {
    hotwords: ["neo_ya", "neo_ya"],
    file: "neoya.umdl",
    sensitivity: "0.7,0.7",
  },
  "hey_extreme": {
    hotwords: "hey_extreme",
    file: "hey_extreme.umdl",
    sensitivity: "0.6",
  },
  "view_glass": {
    hotwords: "view_glass",
    file: "view_glass.umdl",
    sensitivity: "0.7",
  }
}

var _log = function() {
    var context = "[SNOWBOY]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SNOWBOY {
  constructor(config, mic, callback = ()=>{}, debug) {
    this.micConfig = mic
    this.config = config
    this.callback = callback
    this.models = []
    this.mic = null
    this.detector = null
    if (debug == true) log = _log
    this.debug = debug
    this.default = {
      audioGain: 2.0,
      applyFrontend: false,
      applyModel: "smart_mirror",
      applySensitivity: null,
      models: []
    }
    this.config = Object.assign(this.default, this.config)
  }
  init () {
    var models = new Models();
    var modelPath = path.resolve(__dirname, "./models")

    if (this.config.models.length == 0) {
      log("Checking models")
      if (this.config.applyModel) {
        for (let [item, value] of Object.entries(snowboyDict)) {
          if (this.config.applyModel == item) {
            log("Model selected:", item)
            if (this.config.applySensitivity) {
               if ((isNaN(this.config.applySensitivity)) || (Math.ceil(this.config.applySensitivity) > 1)) {
                 log("Wrong Sensitivity value.")
               } else {
                if (item == ("jarvis" || "neo_ya")) {
                  value.sensitivity = this.config.applySensitivity + "," + this.config.applySensitivity
                }
                else value.sensitivity = this.config.applySensitivity
                log("Sensitivity set:", this.config.applySensitivity)
              }
            }
            this.config.models.push(value)
          }
        }
      }
    }
    if (this.config.models.length == 0) return console.log("[SNOWBOY][ERROR] No model to load")
    this.config.models.forEach((model)=>{
      model.file = path.resolve(modelPath, model.file)
      models.add(model)
    })
    this.detector = new Detector({
      resource: path.resolve(__dirname, "./common.res"),
      models: models,
      audioGain: this.config.audioGain,
      applyFrontend: this.config.applyFrontend
    })

    this.detector
      .on("error", (err)=>{
        log("Detector Error:", err)
        this.stop()
        return
      })
      .on("hotword", (index, hotword, buffer)=>{
        log("Detected:", hotword)
        this.stop()
        this.callback(hotword)
        return
      })
    log("snowboy v" + require('../package.json').version + " Initialized...")
    this.start()
  }

  start () {
    if (this.mic) return
    this.mic = null

    var defaultOption = {
      sampleRate: 16000,
      channels: 1,
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: this.debug,
    }

    var Options = Object.assign({}, defaultOption, this.micConfig)
    this.mic = new Recorder(Options, this.detector, (err,code)=>{this.callbackErr(err,code)})
    log("Starts listening.")
    this.mic.start()
  }

  stop () {
    if (!this.mic) return
    this.mic.stop()
    this.mic = null
    log("Stops listening.")
  }

  callbackErr (err,code) {
    if (err) {
     console.log("[SNOWBOY][ERROR] " + err)
     this.stop()
     console.log("Retry restarting...")
     setTimeout(() => { this.start() },2000)
     return
    }
    if (code == "1") {
      this.stop()
      setTimeout(() => { this.start() },2000)
    }
  }
}

module.exports = SNOWBOY
