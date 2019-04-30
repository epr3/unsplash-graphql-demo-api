import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, OneToMany, AfterLoad } from 'typeorm';
import bcrypt = require('bcryptjs');
import { Album } from './album';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @Column({ unique: true })
  public email: string;

  @Column({ select: false })
  public password: string;

  @OneToMany(type => Album, album => album.user)
  public albums: Album[];

  @BeforeInsert()
  public async savePassword() {
    const password = this.password;
    const hash = await bcrypt.hash(password, 10);
    this.password = hash;
  }

  public comparePassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }
}
