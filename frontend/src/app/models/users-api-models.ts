// from swagger file users.yml

import { FileTag, UserDevice } from './files-api-models';
import { TwoFactorRecoveryCode } from './two-factor-api-models';

export class User {
  public _id: string; //
  public firstname: string; //
  public lastname: string; //
  public email: string; //
  public phoneNumber: string; //
  public secret: string; //
  public twoFactorApp: boolean; //
  public twoFactorEmail: boolean; //
  public twoFactorSms: boolean; //
  public updated_at: string; //
  public created_at: string; //
  public role: string; //
  public directory_id: string; //
  public tags: FileTag[]; //
  public twoFactorRecoveryCodes: TwoFactorRecoveryCode[]; //
  public theme: string; //

  public subscription?: Subscription;
  public usedSpace: number;
  public availableSpace: number;
  public twoFactorAuthorized: boolean;
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
  status: SubscriptionStatus;
  planId: string;
}

export class Session {
  public device: UserDevice;
  public hashedJWT: string;
  public ip: string;
  public creationDate: Date;
}
