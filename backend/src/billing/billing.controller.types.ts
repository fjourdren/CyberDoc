import { GenericResponse } from '../generic-response.interceptor';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionResponse extends GenericResponse {
  @ApiProperty({
    description: 'sessionId',
    example:
      'cs_test_a1UVYPcQuYRnsY9l8LFKi5o8w6jD6sK6lZfneWXN1dABtev2p6fJdt9aNf',
  })
  sessionId: string;
}

export class GetCustomerPortalURLResponse extends GenericResponse {
  @ApiProperty({ description: 'Customer portal URL' })
  customerPortalURL: string;
}

// noinspection JSUnusedGlobalSymbols
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
} //from Stripe.Subscription.Status;

export class Subscription {
  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Subscription planID',
    example: 'plan2_year',
  })
  planId: string;
}
