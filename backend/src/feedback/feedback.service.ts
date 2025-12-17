import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantFeedback, RestaurantFeedbackDocument } from './schemas/restaurant-feedback.schema';
import { ItemFeedback, ItemFeedbackDocument } from './schemas/menu-item-feedback.schema';
import { populatedUser } from './interfaces/populatedUser';
import { populatedAdmin } from './interfaces/populatedAdmin';
import mongoose from 'mongoose';
import { Types, isValidObjectId } from 'mongoose';

@Injectable()
export class FeedbackService {
  constructor(
@InjectModel(RestaurantFeedback.name) private restaurantFeedback: Model<RestaurantFeedbackDocument>,
@InjectModel(ItemFeedback.name) private itemFeedback: Model<ItemFeedbackDocument>,
) {}



// create a feedback for the restaurant
async createRestaurantFeedback(userId: string, message: string, rating: number) {
  const feedback = new this.restaurantFeedback({
    userId,
    message,
    rating,
    date: new Date(),
    reply: null,
    replyDate: null,
    status: 'pending',
  });

  // Save to MongoDB
  const savedFeedback = await feedback.save();

  // Return the saved feedback
  return savedFeedback;
}




//returns all the feedbacks 
async getAllRestaurantFeedbacks() {
  return this.restaurantFeedback
    .find()
    .sort({ date: -1 })
    .populate('userId', 'name email role phone')    // only select relevant user fields
    .populate('adminId', 'name email role phone')   // only select relevant admin fields
    .exec();
}



//admin reply to a feedback
async replyRestaurantFeedback(
    feedbackId: string,
    adminId: string,
    replyMessage: string,
  ) {
    // Find the feedback by ID and update reply, replyDate, and adminId
    const updatedFeedback = await this.restaurantFeedback.findByIdAndUpdate(
      feedbackId,
      {
        reply: replyMessage,
        replyDate: new Date(),
        status: 'replied',
        adminId, // store the admin who replied
      },
      { new: true }, // return the updated document
    );
  
    if (!updatedFeedback) {
      throw new Error('Feedback not found'); 
    }
  
    return updatedFeedback;
  }
  


// return average rating
async getRestaurantAverageRating(): Promise<number> {
    const result = await this.restaurantFeedback.aggregate([
      {
        $group: {
          _id: null,             // group all documents together
          averageRating: { $avg: '$rating' }, // calculate average
        },
      },
    ]);
  
    // If no feedback exists, return 0
    return result.length > 0 ? result[0].averageRating : 0;
  }



async getRestaurantFeedbackCount(): Promise<number> {
    return this.restaurantFeedback.countDocuments().exec();
  }


//it return the stats for the admin feedbacks dashboard
  async getRestaurantFeedbackStats() {
    const [totalFeedbacks, pendingCount, repliedCount, averageRating] =
      await Promise.all([
        this.restaurantFeedback.countDocuments().exec(), // total
        this.restaurantFeedback.countDocuments({ status: "pending" }).exec(),
        this.restaurantFeedback.countDocuments({ status: "replied" }).exec(),
        this.getRestaurantAverageRating(),
      ]);
  
    return {
      totalFeedbacks,
      pendingCount,
      repliedCount,
      averageRating,
    };
  }
  



//get the newest 5 feedbacks 
async getRecentRestaurantFeedbacks() {
  return this.restaurantFeedback
    .find()                         // remove { rating: 1, message: 1, date: 1 }
    .populate('userId', 'name')     // select only the name from User
    .sort({ date: -1 })
    .limit(5)
    .lean()
    .exec()
    .then(feedbacks =>
      feedbacks.map(fb => {
        const user = fb.userId as unknown as populatedUser;
        return {
          username: user?.name || 'Anonymous', // fallback
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
        };
      })
    );
}


  
      
  //get all feedbacks sorted by date
  async getRestaurantFeedbackSorted() {
    return this.restaurantFeedback
      .find()
      .sort({ date: -1 })
  
      .populate('userId', 'name email phone')
      .populate('adminId', 'name email phone')

      .lean() // convert to plain JS objects
      .exec();
  }
  
  

  
  



//items

async createItemFeedback(userId: string, menuItemId: string, message: string, rating: number) {
  const feedback = new this.itemFeedback({
    userId,
    menuItemId,
    message,
    rating,
    date: new Date(),
    reply: null,
    replyDate: null,
    status: 'pending',
  });

  const savedFeedback = await feedback.save();
  return savedFeedback;
}

  
  

}


