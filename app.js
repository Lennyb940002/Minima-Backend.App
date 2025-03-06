const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db');
const { authRouter } = require('./routes/authRoutes');
const { saleRouter } = require('./routes/saleRoutes');

dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_AUTH,
    process.env.FRONTEND_URL_LOCAL,
    process.env.FRONTEND_URL_LOCAL_AUTH
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(bodyParser.json());

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use('/api', authRouter);
app.use('/api/sales', saleRouter);

module.exports = app;
