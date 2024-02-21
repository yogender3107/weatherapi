import { Sequelize } from "sequelize-typescript";

const { DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST } = process.env;

const connection = new Sequelize({
  database: DATABASE_NAME,
  username: DATABASE_USER, 
  password:DATABASE_PASSWORD,
  host: DATABASE_HOST,
  dialect: 'postgres',
  models: [__dirname + '/../models'],
}) 

connection.authenticate().then(()=> {
  console.log('connection established');
}).catch((err)=> {
  console.error('connection Failed');
})

export default connection;