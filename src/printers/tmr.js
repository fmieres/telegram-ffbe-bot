const 
  { wikiLink, log } = require('../lib/utils')
;

module.exports = { found, suggestions, not_found, for_unit }

function found(tmr, is_full, markup){
  const message = print_full(tmr)
  const replyMarkup = markup([
    { title : 'Gamepedia Link', content : { url : wikiLink(tmr) } },
    { title : `View Related Unit: ${tmr.unit_name}`, content : { callback : `/unit ${tmr.unit_name}` } }
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
  return !!tmr 
    ? print(tmr)
    : ''
}

function print(tmr){
  const { name } = tmr
  return ` <b>TMR</b>: <a href="https://exvius.gamepedia.com/${name}">${name}</a> (${tmr.tmr_type.toLowerCase()})` + '\n'
}

function materia_tmr(tmr){
  return ' Grants:\n' + print_skills(tmr.skills)
}

function print_skills(skills){
  const active_pasive = isActive => isActive ? 'ACTIVE' : 'PASSIVE'
  return skills.map( 
    ({ name, active, effects }) => 
      `  <b>${name}</b> (${active_pasive(active)})` + '\n   ' +
      effects.join('\n   ')
  ).join('\n') + '\n'
}

function equip_tmr({name, effects, stats, skills}){
  const { element_inflict, element_resist, status_inflict, status_resist } = stats 
  return '' + 
    // ( !!effects && effects.length > 0 ? `  ${effects.join(' ')}` + '\n' : '' ) + 
    ( !!stats           ? stats_text(stats) : '' ) +
    tmr_equip_inflict(element_inflict || [], status_inflict || {}) + 
    tmr_equip_resist(element_resist || {} , status_resist || {})   +
    ( skills.length > 0 ? ' Grants:\n' + print_skills(skills) : '' )
    // (!!status_inflict ? tmr_equip_status_inflict(status_inflict) : '')
    // (!!status_resist ? tmr_equip_status_resist(status_resist) : '')
}

const ALL_STATUS =  [ 'Blind', 'Paralyze', 'Confusion', 'Disease', 'Poison', 'Sleep', 'Petrify', 'Silence']
const prepare_status = obj => 
  Object.keys(obj).reduce( (xs, k) => 
    [...xs, `${k}(${obj[k]}%)` ]
  , [])


function tmr_equip_resist(elements, status){
  const checkAllStatusResist = resist => {
    const selected = Object.keys(resist)
    return ALL_STATUS.reduce( (bool, x) => bool && resist[x] === 100, true )
  }
  const resists = checkAllStatusResist(status) ? ['All Status Ailments (100%)', ...prepare_status(elements)] : prepare_status({...status, ...elements}) 
  return resists.length > 0 
    ? ' <b>Resists</b>\n  ' + resists.join(', ') + '\n'
    : ''
}

function tmr_equip_inflict(elements, status){
  const inflicts = [...elements, ...prepare_status(status)]
  return inflicts.length > 0 
    ? ' <b>Inflicts</b>\n  ' + inflicts.join(', ') + '\n'
    : ''
}

const tmr_type_print = {
  equip : equip_tmr,
  materia : materia_tmr
}

function print_full(tmr){
  const { name, type, unique, is_twohanded } = tmr
  return format_name(tmr) + '\n' +
    tmr_type_print[tmr.tmr_type.toLowerCase()](tmr)
}

function format_name({name, tmr_type, unique, is_twohanded, type}){
  const tmr_type_format = {
    equip   : _ => `${ is_twohanded? 'Two Handed ' : '' }${type}`,
    materia : _ => 'Materia'
  }
  return `<b>${name}</b>: ${tmr_type_format[tmr_type.toLowerCase()]()} ${unique? '(unstackable)' : ''}`
}

const main_stats = ['ATK', 'DEF', 'SPR', 'MAG', 'MP', 'HP']

function stats_text(stats){
  return ' ' + main_stats.reduce(
    (list, stat) => stats[stat] > 0 ? [...list, `${stat}:${stats[stat]}`] : list,
    []
  ).join(' ') + '\n' 
}