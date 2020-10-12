import sgMail from '@sendgrid/mail';

class Mailler {

    public static async sendEmailFromArray(msg: sgMail.MailDataRequired[]) {
        sgMail.setApiKey(process.env.SONARQUBE_TOKEN);
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
    
        await Mailler.sendEmailFromArray(msg)
    }


    // send Transactional email
    public static async sendTemplateEmail(to: string, from: string, templateId: string, dynamicTemplateData: string[]): Promise<void> {
        const msg: any = {
            to: to,
            from: from,
            templateId: templateId,
            dynamicTemplateData: dynamicTemplateData
        }
    
        await Mailler.sendEmailFromArray(msg)
    }

}

export default Mailler;