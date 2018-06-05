# we've moved to gitlab https://gitlab.com/illiax/telegram-ffbe-bot

=================================

# telegram-ffbe-bot

## Modulo importación de datos

Los datos son obtenidos de https://github.com/aEnigmatic/ffbe . 

## Variables de entorno en env/

crear archivo envvar.sh 

        #!/bin/bash
        export TOKEN="token"
        export DB_NAME="db"
        export DB_URL="mongodb://----/"

finalmente hacer (para agregarlas a la sesión)
    
    source env.sh 

#### Para docker-compose, hacer un archivo similar sin export ni comillas llamado app.env

## docker-compose

    docker build -t telegram-exvius-bot .

para buildear la imagen de node con mongo

    docker-compose up # -d

para levantar el ambos db y app (-d para dejar como daemon)

## update de db con nuevos datos

    docker exec -it telegramexviusbot_app_1 sh

una vez dentro correr el comando del container

    python import_data_to_mongo/update_db.py
