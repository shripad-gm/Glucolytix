import mongoose from 'mongoose';

const diabetesSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  glucoseReadings: [{
    value: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  pregnancies: {
    type: Number,
    default: 0 
  },
  bloodPressure: {
    type: Number,
    default: 72 
  },
  skinThickness: {
    type: Number,
    default: 20 
  },
  insulin: {
    type: Number,
    default: 0 
  },
  diabetesPedigreeFunction: {
    type: Number,
    default: 0.5 
  },
  prediction: {
    type: String,
    enum: ['non-diabetic', 'diabetic'],
    default: 'non-diabetic'
  },
  isDiabetic: {
    type: Boolean,
    default: false
  }
});

const DiabetesData = mongoose.model('Diabetes', diabetesSchema);
export default DiabetesData;