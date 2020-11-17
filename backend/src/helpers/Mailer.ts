import sgMail from '@sendgrid/mail';

class Mailer {

    public static async sendEmailFromArray(msg: sgMail.MailDataRequired[]): Promise<void> {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send(msg);
    }

    // send email with text
    public static async sendTextEmail(to: string, from: string, subject: string, text: string, html: string): Promise<void> {
        const msg: any = {
            to: to,
            from: from,
            subject: subject,
            text: text,
            html: html
        }
    
        await Mailer.sendEmailFromArray(msg);
    }


    // send Transactional email
    public static async sendTemplateEmail(to: string, from: any, templateId: string, dynamicTemplateData: any): Promise<void> {
        const msg: any = {
            to: to,
            from: from,
            templateId: templateId,
            dynamicTemplateData: dynamicTemplateData
        };

        await Mailer.sendEmailFromArray(msg);
    }

}

export default Mailer;
