@echo off
echo Building ArmyQRCode for shared hosting deployment...

REM Build the React application
npm run build

echo.
echo Build completed successfully!
echo.
echo Next steps:
echo 1. Upload the contents of build/client/ to your web server's document root
echo 2. Upload the php-backend/ directory to your web server
echo 3. Update php-backend/config/database.php with your database settings
echo 4. Create the database tables using the SQL in the README
echo 5. Place the .htaccess file in your web root
echo.
echo For more details, see README_SHARED_HOSTING.md
pause