import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import { SMTPClient } from 'smtp-client';

@Injectable()
export class EmailVerificationService {
  async verifyEmail(email: string): Promise<string> {
    const domain = email.split('@')[1];

    return new Promise((resolve, reject) => {
      dns.resolveMx(domain, async (err, addresses) => {
        if (err) {
          return reject('Error during DNS lookup: ' + err.message);
        }
        if (!addresses || addresses.length === 0) {
          return reject('Domain does not exist or has no MX records.');
        }

        const mxHost = addresses[0].exchange;
        const client = new SMTPClient({
          host: mxHost,
          port: 25, // Try using 587 (submission) instead of 25
          
        });

        try {
          // Retry logic in case of failure
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              await this.performSmtpVerification(client, email);
              resolve('Email is valid!');
              return;
            } catch (error) {
              if (attempt === 3) throw error; // If it's the last attempt, throw the error
              console.warn(`Attempt ${attempt} failed. Retrying...`);
            }
          }
        } catch (error) {
          console.error('SMTP Error:', error);
          if (error.code === 'ECONNREFUSED') {
            resolve('SMTP server refused the connection.');
          } else if (error.message.includes('550')) {
            resolve('Email does not exist.');
          } else if (error === 'SMTP connection timeout') {
            resolve('SMTP connection timed out.');
          } else {
            resolve('Email is invalid!');
          }
          await client.quit(); // Ensure the connection is closed
        }
      });
    });
  }

  private async performSmtpVerification(client: SMTPClient, email: string): Promise<void> {
    await client.connect();
    await client.greet({ hostname: 'yourdomain.com' });
    await client.mail({ from: 'you@yourdomain.com' });
    await client.rcpt({ to: email });
    await client.quit();
  }
}
