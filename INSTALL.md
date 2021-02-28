# INSTALL

## Preparation
- Clone this repositery with submodules
- Copy `.env.template` and rename it to `.env`
- Run `npm install` in `backend` and `frontend` directories
- Install MongoDB and add in `.env` its url : `MONGODB_URL=XXX`
- Install Redis and add in `.env` its url : `REDIS_URL=XXX`

## SendGrid (email sending)

### 1. Create account on https://signup.sendgrid.com/

### 2. Click on `Create a single sender` button

### 3. Fill `Create a sender` form 
**For email fields you can set your personal email address**

- Add in `.env` chosen email address such as : `SENDGRID_MAIL_FROM=hello@example.com`
- Add in `.env` chosen company name such as : `SENDGRID_MAIL_FROM_NAME=Example`

### 4. Wait for an email called `Please Verify Your Single Sender` received on the email previously used
**In this email, click on `Verify Single Sender`**

### 5. Go to https://app.sendgrid.com/settings/api_keys and click on `Create API Key`
- Name : `cyberdoc`
- Permissions : Full

Add in `.env` this API key such as : `SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx`

### 5. Add dynamic templates (https://mc.sendgrid.com/dynamic-templates)

For each of these templates : 
- `SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD`
- `SENDGRID_TEMPLATE_REQUEST_CREATE_ACCOUNT`
- `SENDGRID_TEMPLATE_SHARED_WITH_YOU`
- `SENDGRID_TEMPLATE_2FA_TOKEN`

1. Click on `Create a Dynamic Template`
2. Enter template name (such as `SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD`)
3. Click on the template name and select `Add version`
4. Select `Blank Template`
5. Select `Code Editor`
6. Copy-paste HTML content from source template file (such as `email-templates/SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD`)
7. In the left panel (`Settings`) set an email subject
8. Click on `Save`
9. Click on `Back` (arrow on the upper left of the page)
10. Click on the template name   
11. Add in `.env` a line with showed TemplateID such as : `SENDGRID_TEMPLATE_FORGOTTEN_PASSWORD=d-e1b7fea6d722441eb525f50173577302`

## Twilio (2FA)

### 1. Create account on https://www.twilio.com/try-twilio
### 2. Go to https://www.twilio.com/console

- Add in `.env` Account SID such as : `TWILIO_ACCOUNT_SID=XXX`
- Add in `.env` Auth Token such as : `TWILIO_AUTH_TOKEN=XXX`

### 3. Go to https://www.twilio.com/console/verify/dashboard

1. Click on `Create Service Now`
2. Enter cyberdoc as `Friendly Name`
3. Add in `.env` Service SID such as : `TWILIO_SERVICE_ID=XXX`

### 4. Go to https://www.twilio.com/console/verify/email/new and fill form

- `INTEGRATION NAME` = CyberDoc
- `SENDGRID API KEY` = value of `SENDGRID_API_KEY` in `.env`
- `DEFAULT TEMPLATE ID` = value of `SENDGRID_TEMPLATE_2FA_TOKEN` in `.env`
- `DEFAULT FROM EMAIL` = value of `SENDGRID_MAIL_FROM` in `.env`
- `DEFAULT FROM NAME` = value of `SENDGRID_MAIL_FROM_NAME` in `.env`

**Check previously created Verify Service and click on `Save`**

## Stripe (payment system)

### 1. Create account on https://dashboard.stripe.com/register
### 2. Add CyberDoc subscriptions (https://dashboard.stripe.com/test/products)

1. Plan1
    - Name: `1GB storage plan`
    - 2 prices
        - 1.99 € / month (recurring)
        - 19.99 € / year (recurring)
2. Plan2
    - Name: `5GB storage plan`
    - 2 prices
        - 2.99 € / month (recurring)
        - 29.99 € / year (recurring)
3. Plan3
    - Name: `10GB storage plan`
    - 2 prices
        - 3.99 € / month (recurring)
        - 39.99 € / year (recurring)

Add in `.env` (ID begins with `price_`) (you can see ID after saving a product):
- `PLAN1_MONTH_STRIPEID=price_XXX`
- `PLAN1_YEAR_STRIPEID=price_XXX`
- `PLAN2_MONTH_STRIPEID=price_XXX`
- `PLAN2_YEAR_STRIPEID=price_XXX`
- `PLAN3_MONTH_STRIPEID=price_XXX`
- `PLAN3_YEAR_STRIPEID=price_XXX`

### 3. Get secret key (https://dashboard.stripe.com/test/dashboard)

Click on `Get your API keys` and 
- add `Secret key` in `.env` : `STRIPE_KEY=sk_test_XXX`
- add `Publishable key` in all files in `frontend/src/environments` : `stripePublicKey: 'pk_test_XXX`

## Launch all services
- In `cyberdoc-etherpad` : `./bin/run.sh`
- In `backend` : `npm run start`
- In `frontend` : `npm run start`