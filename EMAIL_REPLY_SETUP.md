# Email Reply Setup Guide

## Overview
This system allows customers to reply to messages via email, and their replies automatically appear in the dashboard.

## How It Works
1. Customer receives a message notification email
2. Customer replies to the email
3. Email service forwards the reply to `/api/email-reply` endpoint
4. Reply appears in the dashboard as a new message

## Setup Options

### Option 1: Gmail with Apps Script (Recommended for testing)
Use a Gmail account to catch replies and POST them to your backend automatically.

1. Go to `script.google.com` and create a new Apps Script project.
2. Paste the following code and replace `BACKEND_URL` with your URL, e.g. `https://workshop-backend-six.vercel.app/api/email-reply`.

```javascript
const BACKEND_URL = 'https://workshop-backend-six.vercel.app/api/email-reply';

function processReplies() {
  const threads = GmailApp.search('label:inbox newer_than:1d');
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(msg => {
      if (msg.isInInbox() && !msg.isStarred()) {
        // Parse bookingId from the body (e.g., "Booking ID: <id>")
        const body = msg.getPlainBody();
        const bookingIdMatch = body.match(/Booking ID:\s*([a-f0-9]{24})/i);
        if (!bookingIdMatch) {
          return; // skip if no booking ID
        }
        const bookingId = bookingIdMatch[1];

        const payload = {
          bookingId,
          customerEmail: msg.getFrom().replace(/.*<|>.*/g, '').trim(),
          customerName: msg.getFrom().split('<')[0].trim(),
          message: body.substring(0, 5000) // keep it reasonable
        };

        const options = {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };

        const res = UrlFetchApp.fetch(BACKEND_URL, options);
        if (res.getResponseCode() === 200) {
          msg.star(); // mark processed
        }
      }
    });
  });
}

function setupTrigger() {
  ScriptApp.newTrigger('processReplies').timeBased().everyMinutes(5).create();
}
```

3. Click Services > Add `UrlFetchApp` if needed, then Deploy > Test deployments.
4. Run `setupTrigger` once to create a 5‑minute polling trigger.
5. Ensure your notification email contains the line `Booking ID: <bookingId>` so the script can associate replies.

### Option 2: Email Service Provider (Production)
- **SendGrid**: Webhook support for incoming emails
- **Mailgun**: Routes for handling incoming emails
- **AWS SES**: Lambda functions for email processing

### Option 3: Custom Email Server
- Set up a mail server (Postfix, etc.)
- Configure email forwarding to your API
- Parse email content and extract replies

## API Endpoint
```
POST /api/email-reply
Content-Type: application/json

{
  "bookingId": "booking_id_here",
  "customerEmail": "customer@email.com",
  "message": "Customer's reply message",
  "customerName": "Customer Name"
}
```

## Testing
You can test the endpoint using curl:
```bash
curl -X POST https://workshop-backend-six.vercel.app/api/email-reply \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "your_booking_id",
    "customerEmail": "customer@email.com",
    "message": "This is a test reply",
    "customerName": "Test Customer"
  }'
```

## Security Notes
- Validate customer email matches booking
- Rate limit the endpoint
- Consider signing shared secret in a custom header from the Apps Script and verify server-side
- Log all email replies for audit purposes 