@echo off
REM Windows shim for `unzip -qo archive.zip -d dest` (used by npx impeccable skills)
setlocal EnableDelayedExpansion
set "ZIP="
set "DEST="
:args
if "%~1"=="" goto run
if /I "%~1"=="-qo" (shift & goto args)
if /I "%~1"=="-q" (shift & goto args)
if /I "%~1"=="-o" (shift & goto args)
if /I "%~1"=="-d" (shift & set "DEST=%~1" & shift & goto args)
set "ZIP=%~1"
shift
goto args
:run
if "%ZIP%"=="" exit /b 1
if "%DEST%"=="" exit /b 1
if not exist "%DEST%" mkdir "%DEST%"
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%DEST%' -Force"
exit /b %ERRORLEVEL%
