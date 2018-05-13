module.exports = { found, suggestions, not_found }

function found(unit){
  const { id, name, skills, sex, game, rarity_min, rarity_max, job, names, stats } = unit
  return `<b> ${name} </b> (${rarity_min}&#9734 - ${rarity_max}&#9734)
  <a href="https://exviusdb.com/static/img/assets/unit/unit_ills_${id}.png">${sex} ${game} ${job}</a><a href="https://exvius.gamepedia.com/${name}">&#x1f517</a>
  ` + stats_formatter(stats) + skills_formatter(skills)
}

function suggestions(name, suggestions){
  return `unit ${name} not found, maybe you were looking for ...`
}

function not_found(name){
  return `unit ${name} not found`
}

function skills_formatter(skills = []){
  return `<b>Skills: </b>` + '\n' +
    skills.map( name => `<code>  -</code><a href="https://exvius.gamepedia.com/${name}">${name}</a>` ).join('\n')
}

function stats_formatter(stats){
  return `<b>Stats: </b> (at max lvl)` + '\n' +
    Object.keys(stats).map( key => {
      const [ _, base, pots ] = stats[key]
      const extraSpace = ['MP', 'HP'].includes(key) ? ' ' : ''
      return `<code>  - ${key}${extraSpace} : ${base}(+${pots})</code>`
    }).join('\n') + '\n'
}