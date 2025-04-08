rd /s /q "project\dist"

cd project
call ng build
cd ..
del /Q plugin\client\*
copy project\dist\angular-plugin\* plugin\client\
"C:\Program Files\7-Zip\7z.exe" a -tzip -mx9 angular_plugin.zip plugin