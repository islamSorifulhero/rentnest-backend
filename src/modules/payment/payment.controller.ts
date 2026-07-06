import { Request, Response } from 'express';
import Stripe from 'stripe';
import httpStatus from '../../utils/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../utils/ApiError';
import config from '../../config';
import { PaymentService } from './payment.service';

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPaymentSession(
    req.user!.userId,
    req.body.rentalRequestId
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment session created successfully',
    data: result,
  });
});

// Stripe webhook - verifies signature using the raw request body
const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = PaymentService.stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhook_secret
    );
  } catch (err: any) {
    throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await PaymentService.confirmPaymentByWebhook(session);
  }

  res.status(200).json({ received: true });
});

// Dev-friendly manual confirm (use if webhook isn't set up yet, e.g. local testing)
const confirmPaymentManually = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.confirmPaymentManually(req.params.rentalRequestId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment confirmed successfully',
    data: result,
  });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getUserPayments(req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentSession,
  handleStripeWebhook,
  confirmPaymentManually,
  getUserPayments,
  getPaymentById,
};
