const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Review = require('./models/reviews');
const User = require('./models/users');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/LMS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

//fetch all reviews
app.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'firstname lastname profilePicture') 
            .exec();

        const reviewsWithUserInfo = reviews.map(review => ({
            _id: review._id,
            reviewText: review.reviewText,
            rating: review.rating,
            publishedDate: review.publishedDate,
            username: `${review.userId.firstname} ${review.userId.lastname}`, 
            profilePicture: review.userId.profilePicture
        }));

        res.json(reviewsWithUserInfo);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

//fetch review details for report
app.get('/review-aggregates', async (req, res) => {
    try {
        const ratingsAggregation = await Review.aggregate([
            /*{ $match: { rating: { $ne: null } } }, */
            { $group: { _id: "$rating", count: { $sum: 1 } } }, 
            { $sort: { _id: 1 } } 
        ]);

        const formattedData = ratingsAggregation.map(item => ({
            starRating: item._id,
            count: item.count
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: 'Error aggregating reviews' });
    }
});

//delete each review using trash can icon
app.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Received request to delete review with ID:', id);
        const result = await Review.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Error deleting review' });
    }
});
  
//filter reviews by username
app.get('/reviews/filter/username', async (req, res) => {
    try {
        const { username } = req.query;

        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            return res.status(400).json({ error: 'Username query cannot be empty' });
        }

        const regex = new RegExp(trimmedUsername, 'i');

        const users = await User.find({
            $or: [
                { $expr: { $regexMatch: { input: { $concat: ['$firstname', ' ', '$lastname'] }, regex } } },
                { $expr: { $regexMatch: { input: { $concat: ['$lastname', ' ', '$firstname'] }, regex } } }
            ]
        });

        const userIds = users.map(user => user._id);

        if (userIds.length === 0) {
            return res.status(404).json({ error: 'No users found with the provided name' });
        }

        const reviews = await Review.find({ userId: { $in: userIds } })
            .populate('userId', 'firstname lastname profilePicture')
            .exec();

        if (reviews.length === 0) {
            return res.status(404).json({ error: 'No reviews found for the provided users' });
        }

        const reviewsWithUserInfo = reviews.map(review => ({
            _id: review._id, 
            reviewText: review.reviewText,
            rating: review.rating,
            publishedDate: review.publishedDate,
            username: `${review.userId.firstname} ${review.userId.lastname}`,
            profilePicture: review.userId.profilePicture
        }));

        res.status(200).json(reviewsWithUserInfo);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

//filter reviews by date range
app.get('/reviews/filter/dateRange', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        const reviews = await Review.find({
            publishedDate: { $gte: start, $lte: end }
        })
        .populate('userId', 'firstname lastname profilePicture')
        .exec();

        const reviewsWithUserInfo = reviews.map(review => ({
            _id: review._id, 
            reviewText: review.reviewText,
            rating: review.rating,
            publishedDate: review.publishedDate,
            username: `${review.userId.firstname} ${review.userId.lastname}`,
            profilePicture: review.userId.profilePicture
        }));

        res.status(200).json(reviewsWithUserInfo);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching filtered reviews' });
    }
});


// Fetch users with ratings <= 3
app.get('/low-ratings', async (req, res) => {
    try {
        const lowRatings = await Review.find({ rating: { $lte: 3 } })
            .populate('userId', 'firstname lastname') 
            .exec();
        
        const formattedLowRatings = lowRatings.map(review => ({
            username: `${review.userId.firstname} ${review.userId.lastname}`, 
            rating: review.rating
        }));

        res.json(formattedLowRatings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching low ratings' });
    }
});

//delete all fitered reviews
app.delete('/reviews/deleteAll', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No review IDs provided' });
        }

        const result = await Review.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ message: `${result.deletedCount} reviews deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting reviews' });
    }
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
