// models/EmailTemplate.js
import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  id: Number,
  type: {
    type: String,
    enum: ['title', 'content', 'image'],
    required: true
  },
  content: mongoose.Schema.Types.Mixed,
  order: Number
});

const emailTemplateSchema = new mongoose.Schema({
  sections: [sectionSchema],
  styles: {
    titleSize: String,
    contentSize: String,
    alignment: String,
    theme: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('EmailTemplate', emailTemplateSchema);