@echo off
echo Pulizia files non necessari per versione locale...

REM Elimina cartelle del backend e database
if exist "backend" rmdir /s /q "backend"
if exist "database" rmdir /s /q "database"
if exist "deployment" rmdir /s /q "deployment"
if exist "infra" rmdir /s /q "infra"
if exist "mobile" rmdir /s /q "mobile"

REM Elimina files del frontend non utilizzati
if exist "frontend" (
    del /q "frontend\*.html" 2>nul
    del /q "frontend\*.json" 2>nul
    del /q "frontend\*.bat" 2>nul
    del /q "frontend\*.js" 2>nul
    if exist "frontend\css" rmdir /s /q "frontend\css"
    if exist "frontend\js" rmdir /s /q "frontend\js"
    rmdir "frontend" 2>nul
)

REM Elimina files di configurazione non necessari
del /q "azure.yaml" 2>nul
del /q "package*.json" 2>nul
del /q "*.md" 2>nul

REM Rinomina il README locale
if exist "README-locale.md" ren "README-locale.md" "README.md"

echo.
echo Pulizia completata!
echo.
echo Struttura finale:
echo - index.html (applicazione principale)
echo - js/ (moduli JavaScript)
echo - README.md (documentazione)
echo.
pause