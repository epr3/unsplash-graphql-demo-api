import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from 'typeorm';
import { Album } from './album';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public unsplashId: string;

  @ManyToOne(type => Album, album => album.images)
  public album: Album;
}
