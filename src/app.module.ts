import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { UserHelperService } from './user-helper/user-helper.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.BASE_DATOS_HOST,
      port: parseInt(process.env.BASE_DATOS_PORT, 10),
      username: process.env.BASE_DATOS_USER,
      password: process.env.BASE_DATOS_PASSWORD,
      database: process.env.BASE_DATOS_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true //Solo en modo desarrollo.
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, UserHelperService],
})
export class AppModule { }
