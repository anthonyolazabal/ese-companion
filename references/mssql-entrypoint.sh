#!/bin/bash
# Start SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
for i in {1..30}; do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -Q "SELECT 1" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "SQL Server is ready."
        break
    fi
    sleep 2
done

# Create the database
echo "Creating hivemq_ese database..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'hivemq_ese') CREATE DATABASE hivemq_ese;"

# Run init scripts
echo "Running schema creation..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d hivemq_ese -i /init/01-schema.sql

echo "Inserting default permissions..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d hivemq_ese -i /init/02-permissions.sql

echo "Inserting default roles..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d hivemq_ese -i /init/03-roles.sql

echo "MSSQL initialization complete."

# Wait for SQL Server process
wait
