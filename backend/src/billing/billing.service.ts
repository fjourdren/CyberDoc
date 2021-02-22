import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Subscription, SubscriptionStatus } from './billing.controller.types';

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private returnUrl: string;
  private planIdToStripePriceId = {};
  private stripePriceIdToPlanId = {};
  private readonly stripeDisabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.stripeDisabled = configService.get<boolean>('DISABLE_STRIPE');
    if (this.stripeDisabled) {
      if (!parseInt(configService.get<string>('STORAGE_SPACE'))) {
        throw new InternalServerErrorException(`Missing STORAGE_SPACE envvar`);
      }
    } else {
      const requiredEnvVarsForStripe = [
        'STRIPE_KEY',
        'STRIPE_RETURN_URL',
        'PLAN1_MONTH_STRIPEID',
        'PLAN1_YEAR_STRIPEID',
        'PLAN2_MONTH_STRIPEID',
        'PLAN2_YEAR_STRIPEID',
        'PLAN3_MONTH_STRIPEID',
        'PLAN3_YEAR_STRIPEID',
      ];

      for (const requiredEnvVar of requiredEnvVarsForStripe) {
        if (!configService.get<string>(requiredEnvVar)) {
          throw new InternalServerErrorException(
            `Missing ${requiredEnvVar} envvar`,
          );
        }
      }

      this.stripe = new Stripe(
        configService.get<string>('STRIPE_KEY'),
        undefined,
      );

      this.returnUrl = configService.get<string>('STRIPE_RETURN_URL');
      for (const planId of [
        'plan1_month',
        'plan1_year',
        'plan2_month',
        'plan2_year',
        'plan3_month',
        'plan3_year',
      ]) {
        const envVar = `${planId.toUpperCase()}_STRIPEID`;
        const stripePriceId = this.configService.get<string>(envVar);
        this.planIdToStripePriceId[planId] = stripePriceId;
        this.stripePriceIdToPlanId[stripePriceId] = planId;
      }
    }
  }

  async createBillingAccount() {
    if (this.stripeDisabled) return 'no-billing-account';
    const billingAccount = await this.stripe.customers.create();
    return billingAccount.id;
  }

  async deleteBillingAccount(billingAccountID: string) {
    if (!this.stripeDisabled) {
      await this.stripe.customers.del(billingAccountID);
    }
  }

  async getSubscription(billingAccountID: string): Promise<Subscription> {
    if (this.stripeDisabled) return null;
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
        'Subscription must have only one subscription_item',
      );
    }

    const priceId = stripeSubscription.items.data[0].price.id;
    const planId = this.stripePriceIdToPlanId[priceId];
    if (!planId) {
      throw new InternalServerErrorException(`Unknown priceId : '${priceId}'`);
    }

    return {
      status: stripeSubscription.status as SubscriptionStatus,
      planId,
    };
  }

  async createCheckoutSession(billingAccountID: string, planId: string) {
    if (this.stripeDisabled) throw new BadRequestException('Stripe disabled');
    if (await this.getSubscription(billingAccountID)) {
      throw new BadRequestException('User already have an active subscription');
    }

    const priceId = this.planIdToStripePriceId[planId];
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
    if (this.stripeDisabled) throw new BadRequestException('Stripe disabled');
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
    if (this.stripeDisabled) {
      return parseInt(this.configService.get<string>('STORAGE_SPACE'));
    }

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
