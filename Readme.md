# Ticket Bot

The Ticket Bot project offers effortless switching between MongoDB, MySQL, and SQLite databases, providing flexibility in database management. It features 5 database models, all of which have been successfully migrated to SQL for enhanced compatibility. 

Built with discord.js, the bot enables seamless interaction with Discord servers and offers a range of ticket management commands, including `/add`, `/attach`, `/close`, `/delete`, `/help`, `/manage`, `/open`, `/remove`, `/setup` and `/commands`. 

To promote scalability and ease of future development, the bot's commands are designed to be modular, allowing for easy updates and the addition of new features without disrupting the core functionality.





## Changing Databases
### config.json
- **db_type**: `sqlite`, `mongodb`, `mysql`  

### .env
---
Depending on the database type you choose in `config.json`, add the following variables to your `.env` file:

##### SQLite:
```
DATABASE_URL="file:./dev.db"
```

##### MySQL:
```
DATABASE_URL="mysql://root:root@localhost:3306/tickets?schema=public"
```

##### MongoDB:
```
MONGO_URI=mongodb://localhost:27017/tickets
```


### schema.prisma
---
*Only for SQL databases*

Depending on the database type you choose in `config.json`, change the provide under the datasource to match your databases.



- **provider**: `sqlite`, `mysql`




