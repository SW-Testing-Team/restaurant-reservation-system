import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { ItemFeedback, ItemFeedbackSchema } from './schemas/item-feedback.schema';
import { RestaurantFeedback, RestaurantFeedbackSchema } from './schemas/restaurant-feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ItemFeedback.name, schema: ItemFeedbackSchema },
      { name: RestaurantFeedback.name, schema: RestaurantFeedbackSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService], // if another module will use this service
})
export class FeedbackModule {}
