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
command=python main.py <<TOKEN>>
process_name=%(program_name)s
directory=/home/federico/develop/self/telegram_exvius_bot/bot/
autostart=false
autorestart=true
stdout_logfile=/var/log/supervisor/telebot.ffbe.log
stderr_logfile=/var/log/supervisor/telebot.fbbe-error.log
```