const 
  { wikiLink } = require('../lib/utils')
;

module.exports = { found, suggestions, not_found, for_unit }

function found(tmr, is_full, markup){
  const message = print_full(tmr)

  const replyMarkup = markup([
    ...[{ title : 'Gamepedia Link', content : { url : wikiLink(tmr) } }]
    /*,
    ...(!!unit.tmr ? [{ title : 'Ask for TMR', content : { callback : `/tmr ${unit.tmr.name}` } }] : [])*/
  ])
  return { message, replyMarkup }
}

function suggestions(name, suggestions){
  return { message : `tmr ${name} not found, maybe you were looking for ...`, }
}

function not_found(name){
  return `tmr ${name} not found`
}

function for_unit(tmr, is_full){
  // return print(tmr)
  return !!tmr 
    // ? ( is_full ? print_full(tmr) : print(tmr) ) 
    ? print(tmr)
    : ''
}

function print(tmr){
  const { name } = tmr
  return ` <b>TMR</b>: <a href="https://exvius.gamepedia.com/${name}">${name}</a> (${tmr.tmr_type.toLowerCase()})` + '\n'
}

function materia_tmr(){
  return ''
}

function equip_tmr({name, effects, stats, type}){
  const { element_inflict, element_resist, status_inflict, status_resist } = stats 
  return '' + 
    (!!effects && effects.length > 0 ? `  ${effects.join(' ')}` + '\n' : '' ) + 
    `  <b>${type}</b>` + '\n' + 
    (!!stats                         ? `   ${stats_text(stats)}` + '\n' : '' ) +
    (!!element_inflict ? tmr_equip_elements_inflict(element_inflict) : '') + 
    (!!element_resist  ? tmr_equip_elements_resist(element_resist)   : '')
    // (!!status_inflict ? tmr_equip_status_inflict(status_inflict) : '')
    // (!!status_resist ? tmr_equip_status_resist(status_resist) : '')
}

function tmr_equip_elements_resist(obj){
  return '  <b>Element Resist</b>\n' + 
    '   ' + Object.keys(obj).reduce((accum, element) => [...accum, `${element}: ${obj[element]}`], []).join(', ') + '\n'
}

function tmr_equip_elements_inflict(list){
  return '  <b>Element</b> ' + list.join(', ') + '\n'
}

const tmr_type_print = {
  equip : equip_tmr,
  materia : materia_tmr
}

function print_full(tmr){
  const { name, effects, stats, type } = tmr
  return ` <b>TMR</b>: <a href="https://exvius.gamepedia.com/${name}">${name}</a> (${tmr.tmr_type.toLowerCase()})` + '\n' +
    tmr_type_print[tmr.tmr_type.toLowerCase()](tmr)
    // (!!effects && effects.length > 0 ? `  ${effects.join(' ')}` + '\n' : '' ) + 
    // (!!type <b>${tmr.type}</b>)
    // (!!stats                         ? `  ${stats_text(stats)}` + '\n' : '' ) 
}

const main_stats = ['ATK', 'DEF', 'SPR', 'MAG', 'MP', 'HP']

function stats_text(stats){
  return main_stats.reduce(
    (list, stat) => stats[stat] > 0 ? [...list, `${stat}:${stats[stat]}`] : list,
    []
  ).join() 
}