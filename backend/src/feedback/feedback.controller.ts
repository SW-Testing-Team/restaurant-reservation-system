import { Controller, Get, Post, Body, Param,Patch, Query, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
//import { JwtAuthGuard } from '../auth/jwt-auth.guard'; //waiting for the auth jwt to be implemented

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('restaurant')
  @UseGuards(AuthGuard) // your JWT/auth guard
  async createRestaurantFeedback(
    @Body('message') message: string,
    @Body('rating') rating: number,
    @Req() req,
  ) {
    const userId = req.user.id; // logged-in user's ID
  
    return this.feedbackService.createRestaurantFeedback(userId, message, rating);
  }
  


@Get('restaurant')
//@UseGuards(AuthGuard) // optional: if only logged-in users can view
async getAllRestaurantFeedbacks() {
  return this.feedbackService.getAllRestaurantFeedbacks();
}



@Patch('restaurant/:feedbackId/reply')
@UseGuards(AdminGuard) // ensure only admins can reply
async replyRestaurantFeedback(
  @Param('feedbackId') feedbackId: string,
  @Body('reply') replyMessage: string,
  @Req() req,
) {
  const adminId = req.user.id; // logged-in admin's ID

  return this.feedbackService.replyRestaurantFeedback(
    feedbackId,
    adminId,
    replyMessage,
  );
}


@Get('restaurant/average-rating')
async getRestaurantAverageRating() {
  return this.feedbackService.getRestaurantAverageRating();
}


@Get('restaurant/count')
async getRestaurantFeedbackCount() {
  return this.feedbackService.getRestaurantFeedbackCount();
}



@Get('restaurant/recent')
async getRecentRestaurantFeedbacks() {
  return this.feedbackService.getRecentRestaurantFeedbacks();
}



@Get('restaurant/all-feedbacks')
async getFeedbackWithReplies() {
  return this.feedbackService.getFeedbackWithReplies();
}


@Post('item/:menuItemId')
@UseGuards(AuthGuard) // only logged-in users
async createItemFeedback(
  @Param('menuItemId') menuItemId: string, // current item being reviewed
  @Body('message') message: string,
  @Body('rating') rating: number,
  @Req() req,
) {
  const userId = req.user.id; // logged-in user's ID

  return this.feedbackService.createItemFeedback(
    userId,
    menuItemId,
    message,
    rating,
  );
}



@Get('item/all')
async getAllItemFeedbacks() {
  return this.feedbackService.getAllItemFeedbacks();
}



@Patch('item/:id/reply')
@UseGuards(AdminGuard) // only admins can reply
async replyItemFeedback(
  @Param('id') id: string,           // the _id of the item feedback document
  @Body('reply') replyMessage: string,
  @Req() req,
) {
  const adminId = req.user.id;       // logged-in admin's ID

  return this.feedbackService.replyItemFeedback(
    id,         // feedback document _id
    adminId,
    replyMessage,
  );
}



@Get('item/:menuItemId/average-rating')
async getItemAverageRating(@Param('menuItemId') menuItemId: string) {
  return this.feedbackService.getItemAverageRating(menuItemId);
}

@Get('item/count')
async getItemFeedbackCount(@Query('menuItemId') menuItemId?: string) {
  return this.feedbackService.getItemFeedbackCount(menuItemId);
}



@Get('item/recent')
async getRecentItemFeedbacks(@Query('menuItemId') menuItemId?: string) {
  return this.feedbackService.getRecentItemFeedbacks(menuItemId);
}



@Get('item/with-replies')
async getItemFeedbackWithReplies(@Query('menuItemId') menuItemId?: string) {
  return this.feedbackService.getItemFeedbackWithReplies(menuItemId);
}


@Get('item/top-rated')
async getTopRatedMenuItems(@Query('limit') limit?: number) {
  // Convert query param to number and use default 5 if not provided
  const topLimit = limit ? Number(limit) : 5;
  return this.feedbackService.getTopRatedMenuItems(topLimit);
}

  }

