import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Subscription, SubscriptionStatus } from './billing.controller.types';

const PLANID_TO_STRIPE_PRICEID = {
  plan1_month: 'price_1IBPCxJtuzyH7f5DWTmyIdYr',
  plan1_year: 'price_1IBPCxJtuzyH7f5DIjvO5orW',
  plan2_month: 'price_1IBPDOJtuzyH7f5D2v3I0vst',
  plan2_year: 'price_1IBPDOJtuzyH7f5DsTWyrikn',
  plan3_month: 'price_1IBPDnJtuzyH7f5D18SfnaGZ',
  plan3_year: 'price_1IBPDnJtuzyH7f5DefYG6quO',
};

const STRIPE_PRICEID_TO_PLANID = {
  price_1IBPCxJtuzyH7f5DWTmyIdYr: 'plan1_month',
  price_1IBPCxJtuzyH7f5DIjvO5orW: 'plan1_year',
  price_1IBPDOJtuzyH7f5D2v3I0vst: 'plan2_month',
  price_1IBPDOJtuzyH7f5DsTWyrikn: 'plan2_year',
  price_1IBPDnJtuzyH7f5D18SfnaGZ: 'plan3_month',
  price_1IBPDnJtuzyH7f5DefYG6quO: 'plan3_year',
};

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_KEY'),
      undefined,
    );

    this.returnUrl = configService.get<string>('STRIPE_RETURN_URL');
  }

  async createBillingAccount() {
    const billingAccount = await this.stripe.customers.create();
    return billingAccount.id;
  }

  async deleteBillingAccount(billingAccountID: string) {
    await this.stripe.customers.del(billingAccountID);
  }

  async getSubscription(billingAccountID: string): Promise<Subscription> {
    const response = await this.stripe.subscriptions.list({
      customer: billingAccountID,
    });

    if (response.data.length === 0) return null;
    if (response.data.length !== 1) {
      throw new InternalServerErrorException(
        'Multiple subscriptions for a user',
      );
    }

    const stripeSubscription = response.data[0];
    if (stripeSubscription.items.data.length !== 1) {
      throw new InternalServerErrorException(
        'Multiple subscription_item in subscription',
      );
    }

    const priceId = stripeSubscription.items.data[0].price.id;
    const planId = STRIPE_PRICEID_TO_PLANID[priceId];
    if (!planId) {
      throw new InternalServerErrorException(`Unknown priceId : '${priceId}'`);
    }

    return {
      status: stripeSubscription.status as SubscriptionStatus,
      planId,
    };
  }

  async createCheckoutSession(billingAccountID: string, planId: string) {
    if (await this.getSubscription(billingAccountID)) {
      throw new BadRequestException('User already have an active subscription');
    }

    const priceId = PLANID_TO_STRIPE_PRICEID[planId];
    if (!priceId) {
      throw new BadRequestException(`Unknown planId : '${planId}'`);
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: billingAccountID,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: this.returnUrl,
      cancel_url: this.returnUrl,
    });

    return session.id;
  }

  async createCustomerPortalURL(billingAccountID: string) {
    if (!(await this.getSubscription(billingAccountID))) {
      throw new BadRequestException("User don't have any active subscription");
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: billingAccountID,
      return_url: this.returnUrl,
    });
    return session.url;
  }

  getAvailableSpaceForSubscription(subscription: Subscription) {
    if (!subscription) {
      return 104857600; //100MB
    }

    switch (subscription.planId) {
      case 'plan1_month':
      case 'plan1_year': {
        return 1073741824; //1GB
      }
      case 'plan2_month':
      case 'plan2_year': {
        return 5368709120; //5GB
      }
      case 'plan3_month':
      case 'plan3_year': {
        return 10737418240; //10GB
      }
    }

    throw new InternalServerErrorException(
      `Unknown planId: '${subscription.planId}'`,
    );
  }
}
