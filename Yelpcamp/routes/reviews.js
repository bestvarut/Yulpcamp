const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn, validateReview } = require("../middleware");

const wrapAsync = require('../utils/wrapAsync');



router.post('/', validateReview, wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully create a new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully delete a review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;