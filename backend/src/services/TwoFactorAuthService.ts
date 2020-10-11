import axios from 'axios';
import qs from 'qs';
import IUser, { User } from '../models/User';
import { requireNonNull } from '../helpers/DataValidation';

class TwoFactorAuthService {
    // SEND TOKEN
    /**
     * Send 2FA token to specified user by EMAIL or SMS
     * @param authy_id 
     */
    public static async sendToken(sending_way: string, authy_id: string): Promise<any> {
        let res: any;
        switch(sending_way) {
            case 'email':
                res = await axios.post(`https://api.authy.com/protected/json/${sending_way}/${authy_id}?force=true`, null, {
                    headers: {
                        'X-Authy-API-KEY': process.env.AUTHY_API_KEY
                    }
                });
                break;
            case 'sms':
                res = await axios.get(`https://api.authy.com/protected/json/${sending_way}/${authy_id}?force=true`, {
                    headers: {
                        'X-Authy-API-KEY': process.env.AUTHY_API_KEY
                    }
                });
                break;
        }
        
        return res.data;
    }

    /**
     * Send Push Authentication Request
     * @param authy_id
     */
    public static async sendPushNotification(authy_id: string, email: string): Promise<any> {
        let res = await axios.post(`https://api.authy.com/onetouch/json/users/${authy_id}/approval_requests`, {
            message: 'Login requested for a CyberDoc account.',
            details: {
                username: email
            }, 
            seconds_to_expire: 120,
        }, {
            headers: {
                'X-Authy-API-KEY': process.env.AUTHY_API_KEY
            }
        });
        return res.data;
    }

    // VERIFY TOKEN
    /**
     * Verify that the provided token is correct
     * @param authy_id 
     * @param token 
     */
    public static async verifyToken(authy_id: string, token: string): Promise<any> {
        let res = await axios.get(`https://api.authy.com/protected/json/verify/${token}/${authy_id}`, {
            headers: {
                'X-Authy-API-KEY': process.env.AUTHY_API_KEY
            }
        });
        return res.data;
    }

    /**
     * Check status of push authentication request
     * @param approval_uuid
     */
    public static async verifyPushNotification(approval_request_id: string): Promise<any> {
        let res = await axios.get(`https://api.authy.com/onetouch/json/approval_requests/${approval_request_id}`, {
            headers: {
                'X-Authy-API-KEY': process.env.AUTHY_API_KEY
            }
        });
        return res.data;
    }

    // MANAGE 2FA
    /**
     * Add 2FA User to Twilio Authy database
     * @param email 
     * @param phone_number 
     * @param country_code
     */
    public static async add(email: string, phone_number: string, country_code: string): Promise<any> {
        var data = {
            user: {
                email: email,
                cellphone: phone_number,
                country_code: country_code
            }
        };
        let res = await axios.post('https://api.authy.com/protected/json/users/new', qs.stringify(data), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'X-Authy-API-KEY': process.env.AUTHY_API_KEY
            }
        });
        
        return res.data;
    }

    /**
     * Remove 2FA User from database
     * @param authy_id
     */
    public static async delete(authy_id: string): Promise<any> {
        let res = await axios.post(`https://api.authy.com/protected/json/users/${authy_id}/remove`, null, {
            headers: {
                'X-Authy-API-KEY': process.env.AUTHY_API_KEY
            }
        });
        return res.data;
    }
    
    /**
     * Generate 2FA QrCode
     * @param email
     * @param authy_id
     */
    public static async generateQrCode(email: string, authy_id: string): Promise<any> {
        let res = await axios.post(`https://api.authy.com/protected/json/users/${authy_id}/secret`, {
            label: email
        }, {
            headers: {
                'X-Authy-API-KEY': process.env.AUTHY_API_KEY
            }
        });
        return res.data;
    }
}

export default TwoFactorAuthService;