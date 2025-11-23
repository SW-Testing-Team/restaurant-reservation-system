import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MenuModule } from './menu/menu.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    AuthModule,
    ReservationsModule,
    MenuModule,
    FeedbackModule,
    DashboardModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      'mongodb+srv://admin:C6xIzFO0lQyCDdCW@main.dzqmb8v.mongodb.net/restaurant',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
