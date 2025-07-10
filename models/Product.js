// models/Product.js

import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name:        { type: String,  required: true },
  price:       { type: Number,  required: true },
  cpu:         { type: String,  required: true },
  motherboard: { type: String,  required: true },
  featuresMotherboard:   { type: [String], default: [] },
  ram:         { type: String,  required: true },
  gpu:         { type: String,  required: true },
  storage:     { type: String,  required: true },
  cooler:      { type: String,  required: true },
  case:        { type: String,  required: true },
  featuresCase:         { type: [String], default: [] },
  powerSupply: { type: String,  required: true },
  image:       { type: String,  required: true },
  createdAt:   { type: Date,    default: Date.now },
});

export default mongoose.models.Product ||
       mongoose.model('Product', ProductSchema);
