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


@Post('addItemFeedback/:menuItemId')
@UseGuards(JwtAuthGuard)
async createItemFeedback(
  @Param('menuItemId') menuItemId: string,
  @Body('message') message: string,
  @Body('rating') rating: number,
  @Req() req,
) {
  const userId = req.user.id;

  // Remove any accidental colon
  if (menuItemId.startsWith(':')) {
    menuItemId = menuItemId.slice(1);
  }

  return this.feedbackService.createItemFeedback(
    userId,
    menuItemId,
    message,
    rating,
  );
}



// Get all feedbacks for a specific menu item
@Get('itemFeedbacks/:menuItemId')
async getItemFeedbacksByMenuItem(
  @Param('menuItemId') menuItemId: string,
) {
  return this.feedbackService.getItemFeedbacksByMenuItem(menuItemId);
}





@Patch('item/:id/reply')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin') // only admins can reply
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



@Get('itemFeedback/:menuItemId/average-rating')
async getItemAverageRating(@Param('menuItemId') menuItemId: string) {
  return this.feedbackService.getItemAverageRating(menuItemId);
}


@Get('item/:menuItemId/count')
async getItemFeedbackCount(@Param('menuItemId') menuItemId: string) {
  return this.feedbackService.getItemFeedbackCount(menuItemId);
}




@Get('itemFeedbacks/:menuItemId/recent')
async getRecentItemFeedbacks(@Param('menuItemId') menuItemId: string) {
  return this.feedbackService.getRecentItemFeedbacks(menuItemId);
}






@Get('item/top-rated')
async getTopRatedMenuItems(@Query('limit') limit?: number) {
  // Convert query param to number and use default 5 if not provided
  const topLimit = limit ? Number(limit) : 5;
  return this.feedbackService.getTopRatedMenuItems(topLimit);
}



@Delete('restaurant/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // ensure only admins can reply
async deleteRestaurantFeedback(@Param('id') feedbackId: string) {
  const deleted = await this.feedbackService.deleteRestaurantFeedback(feedbackId);
  if (!deleted) {
    throw new NotFoundException('Restaurant feedback not found');
  }
  return { message: 'Restaurant feedback deleted successfully' };
}

@Delete('item/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // ensure only admins can reply
async deleteItemFeedback(@Param('id') feedbackId: string) {
  const deleted = await this.feedbackService.deleteItemFeedback(feedbackId);
  if (!deleted) {
    throw new NotFoundException('Item feedback not found');
  }
  return { message: 'Item feedback deleted successfully' };
}


  }



