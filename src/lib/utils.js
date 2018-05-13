const 
  util = require('util')
;

const 
  maxArrayLength = 30
;

module.exports = {
  log : consoleLog
}


function consoleLog(...args){
  let options = { showHidden:false, depth: null, maxArrayLength , colors : true, breakLength : 120}
  console.log(...(args.map( current => util.inspect(current, options))))
  return args[0]
}