@ECHO OFF
SETLOCAL
CLS

:: All praise BAT files
::
:: Lando Services Script.
::
:: Copyright (C) 2017 Tandem
::

:: Make sure we unset any docker vars
SET DOCKER_HOST=
SET DOCKER_MACHINE_NAME=
SET DOCKER_TLS_VERIFY=
SET DOCKER_CERT_PATH=

:: Start up the Docker daemon
START /I "" "%ProgramFiles%\Docker\Docker\Docker for Windows.exe"

:: Try to get the Daemon running
CALL :TRY 32
GOTO :EOF

:TRY
SET /A MAX=%1
SET /A TRIES=0

:LOOP
IF %TRIES% GEQ %MAX% GOTO RETURN

SET /A TRIES+=1
TIMEOUT %TRIES% && "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" info && (GOTO RETURN) || (GOTO LOOP)

:: Report success if we get this far
:RETURN
IF %ERRORLEVEL% NEQ 0 (
  ECHO "Failed to start Docker engine."
  EXIT /B 4
)
ECHO "Engine activated."
