# CS 349 - Lab 5 - REST API + ReactJS

---Backend setup:
cd backend
npm init -y
npm install bcrypt body-parser cors express express-session pg

---how to connect in windows:
1)go to backend directory:
step1: change the env file to this:(only power shell doesnot need export, unix might)
PGUSER=test
PGPASSWORD=test
PGHOST=localhost
PGPORT=5432
PGDATABASE=splitwise

step2a: login as postgres
psql -U postgres -h localhost
step2b:Ensure user 'test' exists
CREATE USER test with PASSWORD 'test';
step 2c: Grant database creation privilege
ALTER USER test CREATEDB;
step 2d: Verify
\du
(you should see: test | Create DB)
step 2e: exit
\q

step3:(from terminal) Create database 
createdb -h localhost -p 5432 -U test splitwise 
(enter password when prompted : test)

step4: Verify database exists 
a)psql -U postgres -h localhost 
b)\l 
(you will see : splitwise | test | UTF8 ....)
c)\q 

step5:execute the schema(DDL.sql)- (from terminal)
a) psql -h localhost -p 5432 -U test -d splitwise -f DDL.sql 
b)(if DATA.sql also present then execute it also)
psql -h localhost -p 5432 -U test -d splitwise -f DATA.sql

step6: verification
a)connect to database as test
psql -h localhost -p 5432 -U test -d splitwise
b)\dt 
(you will see the tables created)
c)\q

---------Do backedn setup as in doc----------------

---------Do frontend setup as in doc---------------

---------Run the application as in doc-------------
(in running for windows: instead of source env):
$env:DB_USER="test"
$env:DB_PASSWORD="test"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="splitwise"



----------------Things to do----------
while creating and storing variables for login or signup use these names only:username, email,password

