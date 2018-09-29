
c: 

cd "C:\DevJS\bin"

start cmd /k mongod.exe --dbpath="C:\DevJS\mongodb\data"

pause 10

start cmd /k mongo.exe