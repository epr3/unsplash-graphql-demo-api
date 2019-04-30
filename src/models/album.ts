import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user';
import { Image } from './image';

@Entity()
export class Album {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  @ManyToOne(type => User, user => user.albums)
  public user: User;

  @OneToMany(type => Image, image => image.album)
  public images: Image[]
}
