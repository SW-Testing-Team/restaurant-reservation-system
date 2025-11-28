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



//get the newest 5 feedbacks 
    async getRecentRestaurantFeedbacks() {
    return this.restaurantFeedback
      .find({}, { rating: 1, message: 1, date: 1 })
      .populate('userId', 'username profilePicture')
      .sort({ date: -1 })
      .limit(5)
      .lean()
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => {
          const user = fb.userId as unknown as populatedUser;
          return {
            username: user.name,
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
      .exec();
  }
  

  
  



//items

async createItemFeedback(
    userId: string,         // from currently logged-in user
    menuItemId: string,     // the menu item being reviewed
    message: string,        // feedback message
    rating: number          // rating 1-5
  ) {
    const feedback = new this.itemFeedback({
      userId,
      menuItemId,
      message,
      rating,
      date: new Date(),   // current date
      reply: null,        // default state
      replyDate: null,    // default state
      adminId: null,      // no admin replied yet
      status: 'pending',  // default state
    });
  
    return feedback.save();
  }




//Get certain item’s feedbacks
  async getItemFeedbacksByMenuItem(menuItemId: string) {
    // Just search for menuItemId as it is in the database
    const feedbacks = await this.itemFeedback
      .find({ menuItemId })   // <-- simple string match
      .populate('userId', 'name')
      .populate('adminId', 'name')
      .sort({ date: -1 })
      .lean()
      .exec();
  
    // Map to clean output
    return feedbacks.map(fb => {
      const user = fb.userId as unknown as { name: string };
      const admin = fb.adminId ? (fb.adminId as unknown as { name: string }) : null;
  
      return {
        username: user.name,
        rating: fb.rating,
        message: fb.message,
        date: fb.date,
        replyMessage: fb.reply || null,
        replyDate: fb.replyDate || null,
        adminName: admin ? admin.name : null,
        menuItemId: fb.menuItemId,
      };
    });
  }
  
  
  
  


  async replyItemFeedback(
    feedbackId: string,
    adminId: string,
    replyMessage: string
  ) {
    // Find the item feedback by ID and update reply, replyDate, and adminId
    const updatedFeedback = await this.itemFeedback.findByIdAndUpdate(
      feedbackId,
      {
        reply: replyMessage,
        replyDate: new Date(),
        status: 'replied',
        adminId, // store which admin replied
      },
      { new: true } // return the updated document
    );
  
    if (!updatedFeedback) {
      throw new Error('Item feedback not found');
    }
  
    return updatedFeedback;
  }



  
  async getItemAverageRating(menuItemId: string): Promise<number> {
    const result = await this.itemFeedback.aggregate([
      { $match: { menuItemId } },  // filter feedbacks for the specific menu item
      {
        $group: {
          _id: null,               // group all matching documents together
          averageRating: { $avg: '$rating' }, // calculate average rating
        },
      },
    ]);
  
    // If no feedback exists for this item, return 0
    return result.length > 0 ? result[0].averageRating : 0;
  }
  

  async getItemFeedbackCount(menuItemId: string) {
    const count = await this.itemFeedback.countDocuments({ menuItemId });
  
    return {
      menuItemId,
      count,
    };
  }
  
  

 //get the newest 5 item feedbacks


async getRecentItemFeedbacks(menuItemId: string) {
  const feedbacks = await this.itemFeedback
    .find({ menuItemId })              // match specific menuItemId
    .sort({ date: -1 })                // newest first
    .limit(5)                           // only latest 5
    .lean()
    .exec();

  return feedbacks;
}
  



  //returns top rated items (item id, avg rating, total reviews)
  async getTopRatedMenuItems(limit: number = 5) {
    const result = await this.itemFeedback.aggregate([
      {
        $group: {
          _id: '$menuItemId',               // group by menu item
          averageRating: { $avg: '$rating' }, // calculate average rating
          totalReviews: { $sum: 1 }          // optional: count of reviews
        },
      },
      { $sort: { averageRating: -1 } },     // sort by highest average rating
      { $limit: limit },                     // only top N items
    ]);
  
    // return array of objects with menuItemId and average rating
    return result.map(item => ({
      menuItemId: item._id,
      averageRating: item.averageRating,
      totalReviews: item.totalReviews,
    }));
  }
  

  async deleteRestaurantFeedback(feedbackId: string): Promise<boolean> {
    const result = await this.restaurantFeedback.findByIdAndDelete(feedbackId);
    return !!result;
  }
  
  async deleteItemFeedback(feedbackId: string): Promise<boolean> {
    const result = await this.itemFeedback.findByIdAndDelete(feedbackId);
    return !!result;
  }
  
  
  

}

