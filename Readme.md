













# Changing Databases
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




