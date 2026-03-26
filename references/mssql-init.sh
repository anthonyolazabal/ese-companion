#!/bin/bash
# Wait for SQL Server to start
echo "Waiting for SQL Server to start..."
sleep 15

# Run schema creation
echo "Creating ESE schema..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d hivemq_ese -i /docker-entrypoint-initdb.d/01-schema.sql

# Run default inserts (need to adapt syntax for MSSQL)
echo "Inserting default permissions..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d hivemq_ese -i /docker-entrypoint-initdb.d/02-permissions.sql

echo "Inserting default roles..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d hivemq_ese -i /docker-entrypoint-initdb.d/03-roles.sql

echo "MSSQL ESE database initialized."
