
main();

function main(){
  var mongoClient = require('mongodb').MongoClient;
  var mongoInstance = 'mongodb://localhost:27017/ffbe';
  var documentNames = [/*
    'dungeons', 'enhancements', 'equipment',
    'expeditions', 'items', 'limitbursts',
    'materia', 'mog_king', 'recipes', 'skills',
    'summons_boards', *//*'summons'*/, 'units'
  ]

  // var file = require('./node_modules/data/units.json');
  dropAllDocuments(documentNames, mongoInstance, mongoClient)
  // insertAllDocuments()

}

function dropAllDocuments(documentNames, instance, client){
  clientOperation(client, instance, (err, db) => {
    db.collection('units').drop();
    // db.close();
    /*documentNames.forEach( documentName => { 
      // console.log('log: ',documentName);
      db.collection(documentName).drop()
    })*/
  })
}



function standarizeData(file){
  return Object.keys(file).map(function(key){
    var current = file[key]
    current.id = key
    return current
  })
}
 

/*function insertDocument(documentName,db, data, callback) {
  db.collection(documentName).insertMany( 
    data , 
    (err, result) => callback(result) 
  );
}*/

function clientOperation(client, instance, callback){
  client.connect(instance, function(err,db){
    callback(err,db)
    // db.close()
  })
}