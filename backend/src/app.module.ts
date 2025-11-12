import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { MenuModule } from './menu/menu.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, ReservationsModule, MenuModule, FeedbackModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
