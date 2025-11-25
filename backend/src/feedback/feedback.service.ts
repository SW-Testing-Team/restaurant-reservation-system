import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantFeedback, RestaurantFeedbackDocument } from './schemas/restaurant-feedback.schema';
import { ItemFeedback, ItemFeedbackDocument } from './schemas/menu-item-feedback.schema';
import { populatedUser } from './interfaces/populatedUser';
import { populatedAdmin } from './interfaces/populatedAdmin';
import mongoose from 'mongoose';


@Injectable()
export class FeedbackService {
  constructor(
@InjectModel(RestaurantFeedback.name) private restaurantFeedback: Model<RestaurantFeedbackDocument>,
@InjectModel(ItemFeedback.name) private itemFeedback: Model<ItemFeedbackDocument>,
) {}



// create a feedback for the restaurant
async createRestaurantFeedback(userId: string, message: string, rating: number) {
    const feedback = new this.restaurantFeedback({
      userId,              // from currently logged-in user
      message,             // from input
      rating,              // from input
      date: new Date(),    // current date
      reply: null,         // default state
      replyDate: null,     // default state
      status: 'pending',   // default state
    });
}



//returns all the feedbacks 
async getAllRestaurantFeedbacks() {
    // Fetch all feedbacks, sorted by newest first
    return this.restaurantFeedback.find().sort({ date: -1 }).exec();
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
  
      
  //get all feedbacks with and without replies for a display all feedbacks button
  async getRestaurantFeedbackWithReplies() {
  return this.restaurantFeedback
    .find(
      {},
      {
        rating: 1,
        message: 1,
        date: 1,
        reply: 1,
        replyDate: 1,
        adminId: 1,
      }
    )
    .populate('userId', 'username profilePicture') // user info
    .populate('adminId', 'username profilePicture') // admin info
    .sort({ date: -1 })
    .lean()
    .exec()
    .then(feedbacks =>
      feedbacks.map(fb => {
        // Cast populated fields
        const user = fb.userId as unknown as populatedUser;
        const admin = fb.adminId as unknown as populatedAdmin | null;

        return {
          username: user.name,
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
          replyMessage: fb.reply || null,
          replyDate: fb.replyDate || null,
          adminName: admin ? admin.name : null,
        };
      })
    );
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




  async getAllItemFeedbacks(menuItemId?: string) {
    const filter = menuItemId ? { menuItemId } : {};
  
    return this.itemFeedback
      .find(filter)
      .populate('userId', 'username profilePicture')   // user fields
      .populate('adminId', 'username profilePicture')  // admin fields
      .populate('menuItemId', '_id')                   // include menuItemId only
      .sort({ date: -1 })
      .lean()
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => {
          // Cast populated user/admin
          const user = fb.userId as unknown as populatedUser;
          const admin = fb.adminId as unknown as populatedAdmin | null;
  
          return {
            username: user.name,
            rating: fb.rating,
            message: fb.message,
            date: fb.date,
            replyMessage: fb.reply || null,
            replyDate: fb.replyDate || null,
            adminName: admin ? admin.name : null,
            menuItemId: fb.menuItemId?._id || null, // include menu item ID
          };
        })
      );
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
  


  async getItemFeedbackCount(menuItemId?: string): Promise<number> {
    const filter = menuItemId ? { menuItemId: new mongoose.Types.ObjectId(menuItemId) } : {}; // filter by menu item if provided
    return this.itemFeedback.countDocuments(filter).exec();
  }
  

 //get the newest 5 item feedbacks
async getRecentItemFeedbacks(menuItemId?: string) {
  const filter = menuItemId
    ? { menuItemId: new mongoose.Types.ObjectId(menuItemId) }
    : {};

  return this.itemFeedback
    .find(filter, { rating: 1, message: 1, date: 1, menuItemId: 1 })
    .populate('userId', 'username profilePicture') // get user info
    .sort({ date: -1 }) // newest first
    .limit(5)           // only 5 reviews
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
          menuItemId: fb.menuItemId?._id || null, // include menu item ID
        };
      })
    );
}
  


  //get all feedbacks with and without replies for a display all feedbacks button
async getItemFeedbackWithReplies(menuItemId?: string) {
  const filter = menuItemId
    ? { menuItemId: new mongoose.Types.ObjectId(menuItemId) }
    : {};

  return this.itemFeedback
    .find(filter, { rating: 1, message: 1, date: 1, reply: 1, replyDate: 1, adminId: 1, menuItemId: 1 })
    .populate('userId', 'username profilePicture')   // user info
    .populate('adminId', 'username profilePicture')  // admin info if replied
    .sort({ date: -1 }) // newest first
    .lean()
    .exec()
    .then(feedbacks =>
      feedbacks.map(fb => {
        // Cast populated fields
        const user = fb.userId as unknown as populatedUser;
        const admin = fb.adminId as unknown as populatedAdmin | null;

        return {
          username: user.name,
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
          replyMessage: fb.reply || null,
          replyDate: fb.replyDate || null,
          adminName: admin ? admin.name : null,
          menuItemId: fb.menuItemId?._id || null, // include menu item ID
        };
      })
    );
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

