const express = require('express');
const router = express.Router();

const Campground = require('../models/campground');

const { campgroundSchema } = require('../schemas.js');

const wrapAsync = require('../utils/wrapAsync');
const AppError = require('../utils/AppError');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

router.get('/', wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', (req, res) => {

    res.render('campgrounds/new')
})

router.post('/', validateCampground, wrapAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new AppError('Invalid Campground Data', 400); 

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!!')
    res.redirect(`/campgrounds/${campground._id}`)

}))



router.get('/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}))

router.get('/:id/edit', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully update campground!!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully delete campground!!')
    res.redirect('/campgrounds');
}))

module.exports = router;