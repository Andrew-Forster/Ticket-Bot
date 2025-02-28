# Ticket Bot

The Ticket Bot project offers effortless switching between MongoDB, MySQL, and SQLite databases, providing flexibility in database management. It features 5 database models, all of which have been successfully migrated to SQL for enhanced compatibility. 

Built with discord.js, the bot enables seamless interaction with Discord servers and offers a range of ticket management commands, including `/add`, `/attach`, `/close`, `/delete`, `/help`, `/manage`, `/open`, `/remove`, `/setup` and `/commands`. 

To promote scalability and ease of future development, the bot's commands are designed to be modular, allowing for easy updates and the addition of new features without disrupting the core functionality.


## Commands In Action


### Setup
(`/setup`)

https://github.com/user-attachments/assets/fe7df0be-b834-4a30-8cff-565c5bf93da2

### Attach
(`/attach`)

https://github.com/user-attachments/assets/564ee064-9919-4d38-aaa0-b6b2dcc3733d

### Manage Commands
(`/manage`, `/open`, `/close`, `/add`, `/remove`, `/delete`)

https://github.com/user-attachments/assets/2c3e2fbc-1ec3-471f-889f-5b4fb20d55ee


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

**Note:** If you change from mysql to sqlite or visa versa, run the below to update prisma:
```
npx prisma migrate dev --name init
npx prisma generate
```

Then delete the migrations folder if it exists.


