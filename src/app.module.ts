import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { ConfigModule } from '@nestjs/config';
import { ServiceBusModule } from './service-bus/service-bus.module';

@Module({
  imports: [
    StorageModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServiceBusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
