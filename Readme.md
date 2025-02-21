### config.json
- **db_type**: `sqlite`, `mongodb`, `mysql`  

### .env Configuration
Depending on the database type you choose in `config.json`, add the following variables to your `.env` file:

#### SQLite:
`Not Needed`

#### MySQL:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=tickets
```

#### MongoDB:
```
MONGO_URI=mongodb://localhost:27017/tickets
```

