# telegram-ffbe-bot

## Modulo importación de datos

Los datos son obtenidos de https://github.com/aEnigmatic/ffbe . 

npm update + update_db.py actualiza mongo con los datos obtenidos del repo de aEnigmatic.


## Bot

### Instalación

	pip install pyTelegramBotAPI

### Uso
    
    python bot/main.py {TOKEN}
    
El token se solicita al admin

## Supervisord

```
[program:telebot.ffbe]
command=python main.py {TOKEN}
process_name=%(program_name)s
directory=/home/federico/develop/self/telegram_exvius_bot/bot/
autostart=false
autorestart=true
stdout_logfile=/var/log/supervisor/telebot.ffbe.log
stderr_logfile=/var/log/supervisor/telebot.fbbe-error.log
```

supervisor corre como root así que es necesario instalar las mismas librerías de pip como root
  
    pip install pyTelegramBotAPI
    pip install pymongo

## Variables de entorno

crear archivo env.sh (chmod +x env.sh)

        #!/bin/bash
        export TOKEN="token",
        export DB_NAME="db",
        export DB_URL="mongodb://----/"

finalmente hacer (para agregarlas a la sesión)
    
    source env.sh 
