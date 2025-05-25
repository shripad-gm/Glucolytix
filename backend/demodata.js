import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DiabetesData from './models/diabetes.model.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

   const demoData = {
  userId: '6831fceafaa9f3883eef0fc8',
  glucoseReadings: [
    { value: 98, timestamp: new Date('2025-05-22T07:30:00Z') },
    { value: 140, timestamp: new Date('2025-05-22T10:00:00Z') },
    { value: 160, timestamp: new Date('2025-05-22T13:00:00Z') },
    { value: 120, timestamp: new Date('2025-05-22T16:00:00Z') },
    { value: 110, timestamp: new Date('2025-05-22T19:30:00Z') },
    { value: 95, timestamp: new Date('2025-05-22T22:00:00Z') },
    { value: 92, timestamp: new Date('2025-05-23T07:30:00Z') },
    { value: 145, timestamp: new Date('2025-05-23T10:15:00Z') },
    { value: 170, timestamp: new Date('2025-05-23T13:10:00Z') },
    { value: 130, timestamp: new Date('2025-05-23T16:20:00Z') },
    { value: 115, timestamp: new Date('2025-05-23T19:50:00Z') },
    { value: 100, timestamp: new Date('2025-05-23T22:30:00Z') },
    { value: 90, timestamp: new Date('2025-05-24T07:15:00Z') },
    { value: 150, timestamp: new Date('2025-05-24T10:40:00Z') },
    { value: 180, timestamp: new Date('2025-05-24T13:30:00Z') },
    { value: 135, timestamp: new Date('2025-05-24T16:45:00Z') },
    { value: 120, timestamp: new Date('2025-05-24T20:00:00Z') },
    { value: 85, timestamp: new Date('2025-05-24T23:00:00Z') },
    { value: 78, timestamp: new Date('2025-05-25T03:00:00Z') },
    { value: 95, timestamp: new Date('2025-05-25T07:20:00Z') },
    { value: 155, timestamp: new Date('2025-05-25T10:30:00Z') },
    { value: 165, timestamp: new Date('2025-05-25T13:20:00Z') },
    { value: 140, timestamp: new Date('2025-05-25T16:10:00Z') },
    { value: 118, timestamp: new Date('2025-05-25T19:40:00Z') },
    { value: 105, timestamp: new Date('2025-05-25T22:50:00Z') }
  ],
  pregnancies: 1,
  bloodPressure: 78,
  skinThickness: 22,
  insulin: 85,
  diabetesPedigreeFunction: 0.6,
  prediction: 'non-diabetic',
  isDiabetic: false
};


    const result = await DiabetesData.create(demoData);
    console.log('Inserted demo diabetes data:', result);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error inserting demo data:', error);
  }
};

run();
