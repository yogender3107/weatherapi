import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: 'cityWeather'
})
class CityWeather extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  state!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  country!: string;


  @Column({
    type: DataType.DOUBLE,
  })
  lat: number | undefined;

  @Column({
    type: DataType.DOUBLE,
  })
  long: number | undefined;
  
  @Column({
    type: DataType.DOUBLE,
  })
  temp: number | undefined;
}

export default CityWeather;