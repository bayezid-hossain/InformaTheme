@echo off
echo ==================================================
echo         Installing Premium Release APK             
echo ==================================================
echo.

set ADB_EXE=C:\Users\amiba\AppData\Local\Android\Sdk\platform-tools\adb.exe
if not exist "%ADB_EXE%" (
    set ADB_EXE=adb
)

echo Checking ADB connection...
"%ADB_EXE%" devices
echo.
echo Installing c:\Users\amiba\Projects\InformaTheme\android\app\build\outputs\apk\release\app-release.apk...
"%ADB_EXE%" install -r c:\Users\amiba\Projects\InformaTheme\android\app\build\outputs\apk\release\app-release.apk
if %ERRORLEVEL% equ 0 (
    echo.
    echo SUCCESS: Release APK installed successfully!
) else (
    echo.
    echo ERROR: Failed to install APK. Please check device connection or unlock state.
)
echo.
pause
