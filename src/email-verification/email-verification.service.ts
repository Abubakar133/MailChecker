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
          port: 587, // Try using 587 (submission) instead of 25
           // Set to true if you want to use SSL/TLS (port 465)
        });

        try {
          // Set up a timeout for the SMTP connection
          await Promise.race([
            this.performSmtpVerification(client, email),
            new Promise((_, reject) => setTimeout(() => reject('SMTP connection timeout'), 5000)), // 5 seconds timeout
          ]);
          resolve('Email is valid!');
        } catch (error) {
          console.error('SMTP Error:', error);
          if (error === 'SMTP connection timeout') {
            resolve('SMTP connection timed out.');
          } else if (error.code === 'ECONNREFUSED') {
            resolve('SMTP server refused the connection.');
          } else if (error.message.includes('550')) {
            resolve('Email does not exist.');
          } else {
            resolve('Email is invalid!');
          }
          await client.quit(); // Ensure the connection is closed
        }
      });
    });
  }

  // Separate function to handle SMTP verification
  private async performSmtpVerification(client: SMTPClient, email: string): Promise<void> {
    await client.connect();
    await client.greet({ hostname: 'yourdomain.com' });
    await client.mail({ from: 'you@yourdomain.com' });
    await client.rcpt({ to: email });
    await client.quit();
  }
}

@Injectable()
export class EmailVerificationService2 {
  async verifyEmail(email: string): Promise<string> {
  return 'Server is running successfully not!';
  }
}