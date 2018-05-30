const 
  { wikiLink, log } = require('../lib/utils'),
  TmrPrinter = require('./tmr')
;


module.exports = { found, suggestions, not_found }

const
  TYPE_ABILITY = 'ABILITY',
  TYPE_MAGIC = 'MAGIC',
  MAGIC_GREEN = 'Green',
  MAGIC_WHITE = 'White',
  MAGIC_BLACK = 'Black'
;

const emoji_magic_type = {
  [MAGIC_GREEN] : '2733', //'1f49a',
  [MAGIC_WHITE] : '2b1c',
  [MAGIC_BLACK] : '2b1b'
}

function discern_types({magics, abilities, pasives}, current){
  const { type, active } = current
  let accum = undefined;
  if (type === TYPE_MAGIC){
    accum = { magics : [...magics, current], abilities, pasives }
  } else if ( active ){
    accum = { magics, abilities : [...abilities, current], pasives }
  } else {
    accum = { magics, abilities, pasives : [...pasives, current] }
  }
  return accum;
}

function found(unit, is_full, markup){
  // log(unit);
  const message = main_formatter(unit,is_full) + 
    TmrPrinter.for_unit(unit.tmr, is_full) + 
    stats_formatter(unit.stats,is_full) +
    skills_formatter( unit.skills.reduce( discern_types, { magics : [], abilities : [], pasives : [] }), is_full )
  const replyMarkup = markup([
    ...[{ title : 'Gamepedia Link', content : { url : wikiLink(unit) } }],
    ...(!!unit.tmr ? [{ title : `Ask for TMR : ${unit.tmr.name} `, content : { callback : `/tmr ${unit.tmr.name}` } }] : [])
  ])
  return { message, replyMarkup }
}

function suggestions(name, suggestions){
  return { message : `unit ${name} not found, maybe you were looking for ...` }
}

function not_found(name){
  return { message : `unit ${name} not found` }
}

function skills_formatter({ magics, abilities, pasives }, is_full){
  const add_mp_cost = (mp_cost, effects) => !is_full? '' : ` (${mp_cost}mp) ${effects}`
  return '' +
    (!!magics    && magics.length    > 0 ? print_magics(magics, add_mp_cost)       + '\n' : '') + 
    (!!abilities && abilities.length > 0 ? print_abilities(abilities, add_mp_cost) + '\n' : '') + 
    (!!pasives   && pasives.length   > 0 ? print_pasives(pasives, is_full)            : '')    
}

function print_pasives(pasives, is_full){
  return ` <b>Pasives:</b>` + '\n' +
    pasives.map( ({ name,effects }) => 
      `   <a href="https://exvius.gamepedia.com/${name}">${name}</a> ${!is_full ? '' : effects}` ).join('\n')
}

function print_abilities(abilities, add_mp_cost){
  return ` <b>Abilities:</b>` + '\n' +
    abilities.map( ({ name, mp_cost, effects }) => 
      `   <a href="https://exvius.gamepedia.com/${name}">${name}</a>` +
      add_mp_cost(mp_cost, effects) ).join('\n')
}

function print_magics(magics, add_mp_cost){
  return ` <b>Magic:</b>` + '\n' +
    magics.map( ({ name, magic_type, mp_cost, effects }) => 
      `   &#x${emoji_magic_type[magic_type]} <a href="https://exvius.gamepedia.com/${name}">${name}</a>` +
      add_mp_cost(mp_cost, effects) ).join('\n')
}

function stats_formatter(stats, is_full){
  return !is_full ? '' : ` <b>Stats: </b> (at max lvl)` + '\n' +
    Object.keys(stats).map( key => {
      const [ _, base, pots ] = stats[key]
      const extraSpace = ['MP', 'HP'].includes(key) ? ' ' : ''
      return `  <code>${key}${extraSpace} : ${base}(+${pots})</code>`
    }).join('\n') + '\n'
}

function main_formatter(unit, is_full){
  const { id, name, skills, sex, game, rarity_min, rarity_max, job, names, stats } = unit
  return `<a href="https://exviusdb.com/static/img/assets/unit/unit_ills_${id}.png">&#xFE0F</a><a href="https://exvius.gamepedia.com/${name}">${name}</a> (${rarity_min}&#9734 - ${rarity_max}&#9734)` + '\n' + (!is_full ? '' : ` ${sex} ${game} ${job}` + '\n')
}