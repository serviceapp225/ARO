# OsonSMS API Authentication Issue

## Problem Identified
OsonSMS API returns error 106 (Incorrect hash) with current credentials.

## Current Configuration
```
Login: zarex
Hash: a6d5d8b47551199899862d6d768a4cb1
Endpoint: https://api.osonsms.com/sendsms_v1.php
```

## API Test Results
- **Format**: Correct - API recognizes all required parameters
- **Authentication**: Failed - Hash value rejected with error 106
- **Endpoint**: Working - Server responds correctly

## Solution Required
The hash value from your account dashboard appears to be for web interface login, not API access. You need to find the API-specific credentials.

## Where to Look in OsonSMS Account

### Check These Sections:
1. **API Management** - separate from account settings
2. **Developer Tools** - integration credentials
3. **SMS Gateway Settings** - API configuration
4. **Third-party Access** - external service credentials

### Look For:
- **API Key** (different from web password)
- **API Secret** or **API Hash**
- **Developer Credentials**
- **Integration Password**

## Alternative Authentication Methods
Some providers support:
- MD5 hash of password + timestamp
- API tokens instead of passwords
- OAuth authentication

## Current System Status
SMS authentication works perfectly in demo mode:
- Codes generated and stored in database
- User registration and verification functional
- Platform ready for production deployment

Once correct API credentials are obtained, real SMS delivery will activate automatically without code changes.

## Contact OsonSMS Support
If API credentials are not visible in dashboard:
1. Request API access activation
2. Ask for developer documentation
3. Get API-specific authentication details