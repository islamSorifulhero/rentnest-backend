import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import { PaymentController } from './modules/payment/payment.controller';

const app: Application = express();

app.use(cors());

// Stripe webhook needs the RAW body (must be registered BEFORE express.json())
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'RentNest API is running 🏠',
  });
});

app.use('/api', router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
