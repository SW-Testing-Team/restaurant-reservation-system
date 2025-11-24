import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantFeedback, RestaurantFeedbackDocument } from './schemas/restaurant-feedback.schema';
import { ItemFeedback, ItemFeedbackDocument } from './schemas/menu-item-feedback.schema';
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
  

   //get the newest 5 ratings and return: the username, profile pic, rating, message, date posted 
  async getRecentRestaurantFeedbacks() {
    return this.restaurantFeedback
      .find({}, { rating: 1, message: 1, date: 1 }) // select only feedback fields needed
      .populate('userId', 'username profilePicture') // get username & profile picture from user
      .sort({ date: -1 }) // newest first
      .limit(5)           // only 5 reviews
      .lean()             // convert to plain JS objects
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => ({
          username: fb.userId.username, //waiting for implementation
          profilePicture: fb.userId.profilePicture,//waiting for implementation
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
        }))
      );
  }
  //get all feedbacks with and without replies for a display all feedbacks button
  async getFeedbackWithReplies() {
    return this.restaurantFeedback
      .find({}, { rating: 1, message: 1, date: 1, reply: 1, replyDate: 1, adminId: 1 }) // fetch all feedbacks
      .populate('userId', 'username profilePicture') // get user info
      .populate('adminId', 'username profilePicture') // get admin info if reply exists
      .sort({ date: -1 }) // newest first
      .lean()
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => ({
          username: fb.userId.username,    //waiting for user implementation
          userProfilePicture: fb.userId.profilePicture,    //waiting for user implementation
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
          replyMessage: fb.reply || null,
          replyDate: fb.replyDate || null,
          adminName: fb.adminId ? fb.adminId.username : null, //waiting for user implementation
          adminProfilePicture: fb.adminId ? fb.adminId.profilePicture : null, //waiting for user implementation
        })) 
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
    const filter = menuItemId ? { menuItemId } : {}; // filter by menuItemId if provided
  
    return this.itemFeedback
      .find(filter)
      .populate('userId', 'username profilePicture') // include user info
      .populate('adminId', 'username profilePicture') // include admin info if replied
      .sort({ date: -1 }) // newest first
      .lean()
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => ({
          username: fb.userId.username,
          userProfilePicture: fb.userId.profilePicture,
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
          replyMessage: fb.reply || null,
          replyDate: fb.replyDate || null,
          adminName: fb.adminId ? fb.adminId.username : null,
          adminProfilePicture: fb.adminId ? fb.adminId.profilePicture : null,
          menuItemId: fb.menuItemId,
        }))
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
    const filter = menuItemId ? { menuItemId } : {}; // filter by menu item if provided
    return this.itemFeedback.countDocuments(filter).exec();
  }
  


  async getRecentItemFeedbacks(menuItemId?: string) {
    const filter = menuItemId ? { menuItemId } : {};
  
    return this.itemFeedback
      .find(filter, { rating: 1, message: 1, date: 1, menuItemId: 1 }) // select needed fields
      .populate('userId', 'username profilePicture') // get user info
      .sort({ date: -1 }) // newest first
      .limit(5)           // only 5 reviews
      .lean()
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => ({
          username: fb.userId.username,
          userProfilePicture: fb.userId.profilePicture,
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
       
        }))
      );
  }
  

  async getItemFeedbackWithReplies(menuItemId?: string) {
    const filter = menuItemId ? { menuItemId } : {};
  
    return this.itemFeedback
      .find(filter, { rating: 1, message: 1, date: 1, reply: 1, replyDate: 1, adminId: 1, menuItemId: 1 })
      .populate('userId', 'username profilePicture') // user info
      .populate('adminId', 'username profilePicture') // admin info if replied
      .sort({ date: -1 }) // newest first
      .lean()
      .exec()
      .then(feedbacks =>
        feedbacks.map(fb => ({
          username: fb.userId.username,
          userProfilePicture: fb.userId.profilePicture,
          rating: fb.rating,
          message: fb.message,
          date: fb.date,
          replyMessage: fb.reply || null,
          replyDate: fb.replyDate || null,
          adminName: fb.adminId ? fb.adminId.username : null,
          adminProfilePicture: fb.adminId ? fb.adminId.profilePicture : null,
          menuItemId: fb.menuItemId,
        }))
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
  

}
