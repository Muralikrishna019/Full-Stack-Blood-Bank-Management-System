require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://muralikrishna:krishna2527@cluster19.pf50nxs.mongodb.net/bloodbank?retryWrites=true&w=majority&appName=Cluster19',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
};
