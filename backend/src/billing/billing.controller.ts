import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { BillingService } from './billing.service';
import { LoggedUser } from '../auth/logged-user.decorator';
import { User } from '../schemas/user.schema';
import { HttpStatusCode } from '../utils/http-status-code';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCheckoutSessionResponse,
  GetCustomerPortalURLResponse,
} from './billing.controller.types';
import { GenericResponse } from '../generic-response.interceptor';
import { ConfigService } from '@nestjs/config';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  private readonly stripeDisabled: boolean;

  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService,
  ) {
    this.stripeDisabled = configService.get<boolean>('DISABLE_STRIPE');
  }

  @Post('/create-checkout-session')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Create checkout session (setup new subscription)',
    description: 'Create checkout session (setup new subscription)',
  })
  @ApiOkResponse({
    description: 'Success',
    type: CreateCheckoutSessionResponse,
  })
  @ApiBadRequestResponse({
    description: 'User already have an active subscription or unknown planId',
    type: GenericResponse,
  })
  async createCheckoutSession(
    @LoggedUser() user: User,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    if (this.stripeDisabled) throw new BadRequestException('Stripe disabled');
    const sessionId = await this.billingService.createCheckoutSession(
      user.billingAccountID,
      dto.planId,
    );
    return { msg: 'OK', sessionId };
  }

  @Get('/customer-portal-url')
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Get Stripe customer portal url (edit existing subscription)',
    description: 'Get Stripe customer portal url (edit existing subscription)',
  })
  @ApiOkResponse({ description: 'Success', type: GetCustomerPortalURLResponse })
  @ApiBadRequestResponse({
    description: "User don't have any active subscription",
    type: GenericResponse,
  })
  async getCustomerPortalURL(@LoggedUser() user: User) {
    if (this.stripeDisabled) throw new BadRequestException('Stripe disabled');
    const customerPortalURL = await this.billingService.createCustomerPortalURL(
      user.billingAccountID,
    );
    return { msg: 'OK', customerPortalURL };
  }
}
