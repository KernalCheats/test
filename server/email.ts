import nodemailer from 'nodemailer';

interface SupportEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure SMTP transporter with fallback to console logging
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Additional options for better compatibility
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });
    } else {
      // Create a test transporter that logs to console when no SMTP is configured
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  async sendSupportEmail(data: SupportEmailData): Promise<void> {
    const mailOptions = {
      from: `"Kernal.wtf Support" <${process.env.SMTP_USER || 'noreply@kernal.wtf'}>`,
      to: 'support@kernal.com',
      subject: `Support Request: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="margin: 0; text-align: center;">🎮 Kernal.wtf Support Request</h2>
          </div>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border: 1px solid #333;">
            <h3 style="color: #8b5cf6; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            
            <h3 style="color: #ec4899; margin-top: 30px;">Message</h3>
            <div style="background: #000; padding: 15px; border-radius: 5px; border-left: 3px solid #8b5cf6;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666;">
            <p>This email was sent from the Kernal.wtf support form.</p>
            <p>Please respond to ${data.email} to help this customer.</p>
          </div>
        </div>
      `,
      text: `
Support Request from Kernal.wtf

Customer: ${data.name} (${data.email})
Subject: ${data.subject}

Message:
${data.message}

Please respond to ${data.email} to help this customer.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      if (process.env.SMTP_HOST) {
        console.log('Support email sent successfully:', info.messageId);
      } else {
        console.log('=== EMAIL WOULD BE SENT ===');
        console.log('To: support@kernal.com');
        console.log('Subject:', mailOptions.subject);
        console.log('From:', data.name, '(', data.email, ')');
        console.log('Message:', data.message);
        console.log('=== CONFIGURE SMTP TO SEND REAL EMAILS ===');
      }
    } catch (error) {
      console.error('Failed to send support email:', error);
      if (!process.env.SMTP_HOST) {
        // Don't throw error if SMTP is not configured, just log
        console.log('Email logged to console since SMTP is not configured');
        return;
      }
      throw new Error('Failed to send support email');
    }
  }

  async sendConfirmationEmail(customerEmail: string, customerName: string): Promise<void> {
    const mailOptions = {
      from: `"Kernal.wtf Support" <${process.env.SMTP_USER || 'noreply@kernal.wtf'}>`,
      to: customerEmail,
      subject: 'We received your support request - Kernal.wtf',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="margin: 0; text-align: center;">🎮 Thank you for contacting Kernal.wtf</h2>
          </div>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border: 1px solid #333;">
            <p>Hello ${customerName},</p>
            
            <p>Thank you for reaching out to our support team! We've received your message and will get back to you as soon as possible.</p>
            
            <div style="background: #000; padding: 15px; border-radius: 5px; border-left: 3px solid #10b981; margin: 20px 0;">
              <p style="margin: 0;"><strong>✅ Your request has been submitted successfully</strong></p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul style="color: #ccc;">
              <li>Our support team will review your message within 24 hours</li>
              <li>You'll receive a detailed response at this email address</li>
              <li>For urgent issues, you can also reach us on Discord</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://discord.gg/kernal" style="background: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Join our Discord for instant support
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666;">
            <p>Kernal.wtf - Gaming Enhanced</p>
            <p>This is an automated confirmation. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `
Hello ${customerName},

Thank you for reaching out to Kernal.wtf support! We've received your message and will get back to you as soon as possible.

✅ Your request has been submitted successfully

What happens next:
- Our support team will review your message within 24 hours
- You'll receive a detailed response at this email address
- For urgent issues, you can also reach us on Discord: https://discord.gg/kernal

Kernal.wtf - Gaming Enhanced
This is an automated confirmation. Please do not reply to this email.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't throw error for confirmation email - it's not critical
    }
  }

  async sendReplyEmail(customerEmail: string, customerName: string, originalSubject: string, replyMessage: string): Promise<void> {
    const mailOptions = {
      from: `"Kernal.wtf Support" <${process.env.SMTP_USER || 'support@kernal.com'}>`,
      to: customerEmail,
      subject: `Re: ${originalSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="margin: 0; text-align: center;">🎮 Kernal.wtf Support Reply</h2>
          </div>
          
          <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border: 1px solid #333;">
            <p>Hello ${customerName},</p>
            
            <p>Thank you for contacting Kernal.wtf support. Here's our response to your inquiry:</p>
            
            <div style="background: #000; padding: 15px; border-radius: 5px; border-left: 3px solid #8b5cf6; margin: 20px 0;">
              ${replyMessage.replace(/\n/g, '<br>')}
            </div>
            
            <p>If you have any further questions, please reply to this email and we'll be happy to help!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://discord.gg/kernal" style="background: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Join our Discord for instant support
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666;">
            <p>Kernal.wtf - Gaming Enhanced</p>
            <p>This message was sent from our support team.</p>
          </div>
        </div>
      `,
      text: `
Hello ${customerName},

Thank you for contacting Kernal.wtf support. Here's our response to your inquiry:

${replyMessage}

If you have any further questions, please reply to this email and we'll be happy to help!

Join our Discord for instant support: https://discord.gg/kernal

Kernal.wtf - Gaming Enhanced
This message was sent from our support team.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      if (process.env.SMTP_HOST) {
        console.log('Reply email sent successfully:', info.messageId);
      } else {
        console.log('=== REPLY EMAIL WOULD BE SENT ===');
        console.log('To:', customerEmail);
        console.log('Subject:', mailOptions.subject);
        console.log('Reply:', replyMessage);
        console.log('=== CONFIGURE SMTP TO SEND REAL EMAILS ===');
      }
    } catch (error) {
      console.error('Failed to send reply email:', error);
      if (!process.env.SMTP_HOST) {
        // Don't throw error if SMTP is not configured, just log
        console.log('Reply email logged to console since SMTP is not configured');
        return;
      }
      throw new Error('Failed to send reply email');
    }
  }
}

export const emailService = new EmailService();