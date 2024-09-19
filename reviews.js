const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewText: { type: String, default: null, maxlength: [500, 'Review text cannot exceed 500 characters']},
    rating: { type: Number, default: null },
    publishedDate: { type: Date, default: Date.now },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true}
});

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;