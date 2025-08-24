# Deployment & CORS Configuration Guide

## 🚀 CORS Configuration for Deployment

Your backend now has enhanced CORS configuration that will work for both development and production environments.

### 🔧 Current CORS Settings

The backend is configured with:
- **Flexible origin handling** for different environments
- **Preflight request support** for complex HTTP methods
- **Environment-based configuration** for security
- **Comprehensive header support** for various client types

### 📋 Environment Variables

Create a `.env` file in your Backend directory with these settings:

```bash
# Development (allows all origins for testing)
NODE_ENV=development
ALLOW_ALL_ORIGINS=true

# Production (restrict to specific domains)
NODE_ENV=production
ALLOW_ALL_ORIGINS=false
```

### 🌐 Allowed Origins

**Development Mode:**
- All origins allowed (for testing with Postman, etc.)

**Production Mode:**
- `http://localhost:3000` (local development)
- `http://127.0.0.1:3000` (local development)
- `https://your-frontend-domain.com` (your deployed frontend)
- `https://your-backend-domain.com` (your deployed backend)

### 🧪 Testing CORS with Postman

#### 1. Basic GET Request
```
GET https://your-backend-domain.com/api/cors-test
```

#### 2. POST Request with Headers
```
POST https://your-backend-domain.com/api/bookings
Headers:
  Content-Type: application/json
  Authorization: Bearer your_jwt_token
```

#### 3. OPTIONS Preflight Request
```
OPTIONS https://your-backend-domain.com/api/bookings
Headers:
  Origin: https://postman.com
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: Content-Type
```

### 🔍 CORS Test Endpoints

Your backend now includes these test endpoints:

- **`/api/cors-test`** - Basic CORS test
- **`/api/health`** - Health check with CORS headers
- **`OPTIONS *`** - Handles all preflight requests

### 🚨 Common CORS Issues & Solutions

#### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:** Ensure your backend is running and CORS is properly configured

#### Issue: "Method not allowed"
**Solution:** Check that the HTTP method is included in the allowed methods

#### Issue: "Headers not allowed"
**Solution:** Verify required headers are in the `allowedHeaders` list

### 🛠️ Testing Your CORS Configuration

1. **Local Testing:**
   ```bash
   cd Backend
   node test-cors.js
   ```

2. **Postman Testing:**
   - Use the `/api/cors-test` endpoint
   - Check response headers for CORS information
   - Test different HTTP methods

3. **Browser Testing:**
   - Open browser console
   - Make fetch requests to your endpoints
   - Check for CORS errors

### 🔒 Security Considerations

**For Development:**
- `ALLOW_ALL_ORIGINS=true` allows testing from any origin
- Useful for Postman, mobile apps, and development tools

**For Production:**
- Set `ALLOW_ALL_ORIGINS=false`
- Restrict origins to only your domains
- Remove wildcard origins

### 📱 Mobile & Postman Compatibility

- **Postman:** Works with all origins (no origin header sent)
- **Mobile Apps:** Handle no-origin requests gracefully
- **Web Browsers:** Respect CORS policy strictly

### 🚀 Deployment Checklist

- [ ] Set environment variables for production
- [ ] Update allowed origins with your actual domains
- [ ] Test CORS with Postman before going live
- [ ] Verify preflight requests work correctly
- [ ] Check that all your API endpoints respond properly

### 🔧 Troubleshooting

If you encounter CORS issues:

1. **Check server logs** for CORS error messages
2. **Verify environment variables** are set correctly
3. **Test with the CORS test endpoint** first
4. **Check browser console** for detailed error messages
5. **Use Postman** to isolate if it's a CORS or API issue

### 📞 Support

For CORS-related issues:
1. Check the `/api/cors-test` endpoint response
2. Review server logs for CORS errors
3. Verify your environment configuration
4. Test with different origins and methods 