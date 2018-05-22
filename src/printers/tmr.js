module.exports = { found, suggestions, not_found, for_unit }

function found(unit, is_full){
  return ''
}

function suggestions(name, suggestions){
  return `tmr ${name} not found, maybe you were looking for ...`
}

function not_found(name){
  return `tmr ${name} not found`
}

function for_unit(tmr, is_full){
  return !!tmr 
    ? ( is_full ? print_full(tmr) : print(tmr) ) 
    : ''
}

function print_full(tmr){
  const { name, effects } = tmr
  return `<b>${name}</b> ${effects.join(' ')}`
}
function print(tmr){
  console.log('log: ',tmr);
  const { name, effects, stats } = tmr
  return ` <a href="https://exvius.gamepedia.com/${name}">${name}</a>(${tmr.tmr_type.toLowerCase()})` + '\n' +
    (!!effects && effects.length > 0 ? `  ${effects.join(' ')}` + '\n' : '' ) + 
    (!!stats 
      ? `  ATK:${stats.ATK}` + '\n' 
      : '' 
    ) 
}

function stats(stats){
  
}