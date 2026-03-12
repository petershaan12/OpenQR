# ArmyQRCode - Deployment Instructions

## For Shared Hosting Deployment

### Pre-built Distribution
If you just want to deploy the application without building from source:

1. Upload the contents of the `build/client` directory to your web server's document root
2. Upload the `php-backend` directory to your web server
3. Configure your database in `php-backend/config/database.php`
4. Ensure your .htaccess file is properly configured

### Building From Source
If you want to build from source:

1. Run the build script: `build-for-shared-hosting.bat`
2. Follow the pre-built distribution steps above with the newly created `build/client` directory

### Required Files for Production
After building, you need these files/directories on your production server:
- `php-backend/` - Contains the PHP API
- `index.html` and all assets from the build output
- `.htaccess` - For routing and security

### Configuration
- Update `php-backend/config/database.php` with your database credentials
- Ensure your web server has write permissions for PHP sessions