import Stripe from 'stripe';
import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';
import config from '../../config';

const stripe = new Stripe(config.stripe.secret_key);

const createPaymentSession = async (tenantId: string, rentalRequestId: string) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rental) {
    throw new ApiError(404, 'Rental request not found');
  }

  if (rental.tenantId !== tenantId) {
    throw new ApiError(403, 'This is not your rental request');
  }

  if (rental.status !== 'APPROVED') {
    throw new ApiError(400, 'Only approved rental requests can be paid for');
  }

  if (rental.payment) {
    throw new ApiError(400, 'A payment for this rental request already exists');
  }

  const amount = rental.property.price;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Rent payment - ${rental.property.title}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.stripe.success_url}?rentalRequestId=${rental.id}`,
    cancel_url: config.stripe.cancel_url,
    metadata: {
      rentalRequestId: rental.id,
      tenantId,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      rentalRequestId: rental.id,
      userId: tenantId,
      amount,
      provider: 'STRIPE',
      transactionId: session.id,
      status: 'PENDING',
    },
  });

  return { checkoutUrl: session.url, payment };
};

const confirmPaymentByWebhook = async (session: Stripe.Checkout.Session) => {
  const rentalRequestId = session.metadata?.rentalRequestId;
  if (!rentalRequestId) return;

  const payment = await prisma.payment.findUnique({ where: { rentalRequestId } });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED', transactionId: session.id },
  });

  const updatedRental = await prisma.rentalRequest.update({
    where: { id: rentalRequestId },
    data: { status: 'ACTIVE' },
  });

  await prisma.property.update({
    where: { id: updatedRental.propertyId },
    data: { isAvailable: false },
  });
};

const confirmPaymentManually = async (rentalRequestId: string) => {
  const payment = await prisma.payment.findUnique({ where: { rentalRequestId } });
  if (!payment) {
    throw new ApiError(404, 'Payment not found for this rental request');
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED' },
  });

  await prisma.rentalRequest.update({
    where: { id: rentalRequestId },
    data: { status: 'ACTIVE' },
  });

  return updatedPayment;
};

const getUserPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: { rentalRequest: { include: { property: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalRequest: { include: { property: true } } },
  });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  return payment;
};

export const PaymentService = {
  createPaymentSession,
  confirmPaymentByWebhook,
  confirmPaymentManually,
  getUserPayments,
  getPaymentById,
  stripe,
};