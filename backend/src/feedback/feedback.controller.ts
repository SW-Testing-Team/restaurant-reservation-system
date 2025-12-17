import { Controller, Get,Delete, Post, Body, Param,Patch, Query, Req, UseGuards,NotFoundException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';        // for role-based access control
import { Roles } from '../auth/decorators/roles.decorator';   // to specify roles on routes
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('addRestaurantFeedback')
  @UseGuards(JwtAuthGuard) // your JWT/auth guard 'must be authenticated user'
  async createRestaurantFeedback(
    @Body('message') message: string,
    @Body('rating') rating: number,
    @Req() req,
  ) {
    const userId = req.user.id; // logged-in user's ID
  
    return this.feedbackService.createRestaurantFeedback(userId, message, rating);
  }
  


@Get('restaurantFeedback')
//@UseGuards(AuthGuard) // optional: if only logged-in users can view
async getAllRestaurantFeedbacks() {
  return this.feedbackService.getAllRestaurantFeedbacks();
}


//requires an admin user so cant test
@Patch('restaurant/:feedbackId/reply')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // ensure only admins can reply
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


@Get('restaurantFeedbacks/count')
async getRestaurantFeedbackCount() {
  return this.feedbackService.getRestaurantFeedbackCount();
}

@Get('restaurant/stats')
async getRestaurantFeedbackStats() {
  return this.feedbackService.getRestaurantFeedbackStats();
}




@Get('restaurantFeedbacks/recent')
async getRecentRestaurantFeedbacks() {
  return this.feedbackService.getRecentRestaurantFeedbacks();
}



@Get('restaurantFeedbacks/sorted-feedbacks')
async getRestaurantFeedbackSorted() {
  return this.feedbackService.getRestaurantFeedbackSorted();
}


  }



