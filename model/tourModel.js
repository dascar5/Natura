const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');
//pravljenje mongoose scehma
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true, //ne mozes ture sa istim imenom da dodas
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true, //samo za Stringove, mice white space na kraju i pocetku
      required: [true, 'A tour must have a description'],
    }, //recimo neko unese "      Cool", mice white space ispred
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true }, //prikazi virtuelna polja u JSON
    toObject: { virtuals: true },
  }
);

//indexing
tourSchema.index({ price: 1, ratingsAverage: -1 }); //1 ascending order, -1 descending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  //da mi izracuna koliko tura traje u nedeljama i cuva u durationWeeks virtualno polje
  return this.duration / 7;
});

//virtal populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //where the id of the tour is stored
  localField: '_id',
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create() .insertMany will not trigger this middleware
//pre se pokrece prije triggera (save), post posle
//post middleware funkcija ima pristup i next i doc (dokument koji je upravo sacuvan)
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
}); //ne treba nam next kad imamo samo 1 middleware

//tour guides embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//QUERY MIDDLEWARE
//points at the current query, not document
//usecase = pretpostavimo da imamo tajne ture u bazi (VIP), nisu za javnost
//ne zelimo da se tajne ture ikad javljaju u rezultate
//pravimo secret tour field i query samo za ture koje nisu tajne

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
//pokrece se za svaku komandu koja pocinje sa find
//cim getujemo sve ture, ono nalazi sve ture gdje secretTour nije true!
//samim tim, tajna tura ostaje tajna
//sad nam treba pre middleware za find one, jer i dalje mozemo da je nadjemo po ID-u

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
//moze ovo, ali regex
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

//AGGREGATION MIDDLEWARE
//ocemo da filterujemo secret tour iz agregacije
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //unshift da stavi ovaj match kao prvi objekat u pipeline
//   //isto sto i originalni filter za tajnu turu, samo dodat na aggregate
//   console.log(this);
//   next();
// });

//pravljenje mongoose modela
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
