module.exports = { found, suggestions, not_found }

const
  TYPE_ABILITY = 'ABILITY',
  TYPE_MAGIC = 'MAGIC',
  MAGIC_GREEN = 'Green',
  MAGIC_WHITE = 'White',
  MAGIC_BLACK = 'Black'
;

const emojiMagicType = {
  [MAGIC_GREEN] : '1f49a',
  [MAGIC_WHITE] : '2b1c',
  [MAGIC_BLACK] : '2b1b'
}

function discernTypes({magics, abilities, pasives}, current){
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

function found(unit){
  return main_formatter(unit) +
    stats_formatter(unit.stats) +
    skills_formatter( unit.skills.reduce( discernTypes, { magics : [], abilities : [], pasives : [] }) )
}

function suggestions(name, suggestions){
  return `unit ${name} not found, maybe you were looking for ...`
}

function not_found(name){
  return `unit ${name} not found`
}

function skills_formatter({ magics, abilities, pasives }){
  return '' +
    ` <b>Magic:</b>` + '\n' +
    magics.map( ({ name, magic_type, mp_cost, effects }) => 
      `   &#x${emojiMagicType[magic_type]} <a href="https://exvius.gamepedia.com/${name}">${name}</a> (${mp_cost}mp) ${effects}` ).join('\n') + '\n' + '\n' +
    ` <b>Abilities:</b>` + '\n' +
    abilities.map( ({ name, mp_cost, effects }) => 
      `   <a href="https://exvius.gamepedia.com/${name}">${name}</a> (${mp_cost}mp) ${effects}` ).join('\n') + '\n'+ '\n' +
    ` <b>Pasives:</b>` + '\n' +
    pasives.map( ({ name,effects }) => 
      `   <a href="https://exvius.gamepedia.com/${name}">${name}</a> ${effects}` ).join('\n')
}

function stats_formatter(stats){
  console.log(stats)
  return ` <b>Stats: </b> (at max lvl)` + '\n' +
    Object.keys(stats).map( key => {
      const [ _, base, pots ] = stats[key]
      const extraSpace = ['MP', 'HP'].includes(key) ? ' ' : ''
      return `  <code>${key}${extraSpace} : ${base}(+${pots})</code>`
    }).join('\n') + '\n'
}

function main_formatter(unit){
  const { id, name, skills, sex, game, rarity_min, rarity_max, job, names, stats } = unit
  return `<a href="https://exviusdb.com/static/img/assets/unit/unit_ills_${id}.png">&#xFE0F</a><a href="https://exvius.gamepedia.com/${name}">${name}</a> (${rarity_min}&#9734 - ${rarity_max}&#9734)` +
    ` ${sex} ${game} ${job}` + '\n'
}