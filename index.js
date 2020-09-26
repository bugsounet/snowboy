const path=require("path"),fs=require("fs"),Detector=require("./lib/node/index.js").Detector,Models=require("./lib/node/index.js").Models,Recorder=require("@bugsounet/node-lpcm16");var snowboyDict={smart_mirror:{hotwords:"smart_mirror",file:"smart_mirror.umdl",sensitivity:"0.5"},computer:{hotwords:"computer",file:"computer.umdl",sensitivity:"0.6"},snowboy:{hotwords:"snowboy",file:"snowboy.umdl",sensitivity:"0.5"},jarvis:{hotwords:["jarvis","jarvis"],file:"jarvis.umdl",sensitivity:"0.7,0.7"},subex:{hotwords:"subex",file:"subex.umdl",sensitivity:"0.6"},neo_ya:{hotwords:["neo_ya","neo_ya"],file:"neoya.umdl",sensitivity:"0.7,0.7"},hey_extreme:{hotwords:"hey_extreme",file:"hey_extreme.umdl",sensitivity:"0.6"},view_glass:{hotwords:"view_glass",file:"view_glass.umdl",sensitivity:"0.7"},alexa:{hotwords:"alexa",file:"alexa.umdl",sensitivity:"0.6"}},_log=Function.prototype.bind.call(console.log,console,"[SNOWBOY]"),log=function(){};class Snowboy{constructor(i,t,e=(()=>{}),s){this.micConfig=t,this.config=i,this.callback=e,this.model=[],this.models=[],this.mic=null,this.detector=null,1==s&&(log=_log),this.debug=s,this.defaultConfig={usePMDL:!1,PMDLPath:"./",audioGain:2,Frontend:!0,Model:"jarvis",Sensitivity:null},this.config=Object.assign(this.defaultConfig,this.config),this.defaultMicOption={recorder:"arecord",device:"plughw:1",sampleRate:16e3,channels:1,threshold:.5,thresholdStart:null,thresholdEnd:null,silence:"1.0",verbose:!1,debug:this.debug},this.recorderOptions=Object.assign({},this.defaultMicOption,this.micConfig)}init(){var i=path.resolve(__dirname,"./resources/models");if(this.models=new Models,log("Checking models"),this.config.usePMDL){if(this.config.Model&&this.config.usePMDL){var t=path.resolve(__dirname,this.config.PMDLPath);if(!fs.existsSync(t+"/"+this.config.Model+".pmdl"))return console.log("[SNOWBOY] "+t+"/"+this.config.Model+".pmdl file not found !");console.log("[SNOWBOY] Personal Model selected:",this.config.Model+".pmdl");var e={hotwords:this.config.Model,file:t+"/"+this.config.Model+".pmdl",sensitivity:"0.5"};this.config.Sensitivity&&(isNaN(this.config.Sensitivity)||Math.ceil(this.config.Sensitivity)>1?log("Wrong Sensitivity value."):e.sensitivity=this.config.Sensitivity),log("Sensitivity set:",e.sensitivity),this.model.push(e),this.models.add(this.model[0])}}else{if(this.config.Model)for(let[i,t]of Object.entries(snowboyDict))this.config.Model==i&&(console.log("[SNOWBOY] Model selected:",i),this.config.Sensitivity&&(isNaN(this.config.Sensitivity)||Math.ceil(this.config.Sensitivity)>1?log("Wrong Sensitivity value."):t.sensitivity="jarvis"==i?this.config.Sensitivity+","+this.config.Sensitivity:this.config.Sensitivity),log("Sensitivity set:",t.sensitivity),this.model.push(t));if(0==this.model.length)return console.log("[SNOWBOY][ERROR] model not found:",this.config.Model);this.model.forEach(t=>{this.model[0].file=path.resolve(i,this.config.Model+".umdl"),this.models.add(this.model[0])})}}start(){if(!this.models.models.length)return console.log("[SNOWBOY] Constructor Error: No Model is set... I can't start Listening!");this.detector=new Detector({resource:path.resolve(__dirname,"./resources/common.res"),models:this.models,audioGain:this.config.audioGain,applyFrontend:this.config.Frontend}),this.detector.on("error",i=>{this.error(i)}).on("hotword",(i,t,e)=>{log("Detected:",t),this.stopListening(),this.callback(t)}),this.startListening()}stop(){this.stopListening()}error(i,t){return i||"1"==t?(i&&console.log("[SNOWBOY][ERROR] "+i),this.stop(),console.log("[SNOWBOY] Retry restarting..."),void setTimeout(()=>{this.start()},2e3)):"255"==t?(this.stop(),console.log("[SNOWBOY] Timeout waiting restarting !"),void setTimeout(()=>{this.start()},1e3)):void 0}startListening(){this.mic||(this.mic=null,this.mic=new Recorder(this.recorderOptions,this.detector,(i,t)=>{this.error(i,t)}),log("Starts listening."),this.mic.start())}stopListening(){this.mic&&(this.mic.stop(),this.mic=null,log("Stops listening."))}}module.exports=require("./lib/node/index.js"),module.exports.Snowboy=Snowboy;
