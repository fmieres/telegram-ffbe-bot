module.exports = { found, suggestions, not_found }

function found(unit){
  const { id, name } = unit
  return `<b>Name: ${name} </b>
  <a href="https://exviusdb.com/static/img/assets/unit/unit_ills_${id}.png">${name}_${id}</a>
  <a href="https://exvius.gamepedia.com/${name}">Wiki</a>
  `
}

function suggestions(name, suggestions){
  return `unit ${name} not found, maybe you were looking for ...`
}

function not_found(name){
  return `unit ${name} not found`
}

