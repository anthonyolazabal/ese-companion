#!/bin/bash
# Start SQL Server in the background
/opt/mssql/bin/sqlservr &
MSSQL_PID=$!

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
for i in {1..60}; do
    python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('localhost', 1433))
    s.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null && break
    sleep 2
done

echo "SQL Server is ready. Running init scripts..."

# Use python3 with pymssql or just rely on the application to create data
# Since Azure SQL Edge doesn't ship sqlcmd, we'll use a Python script
python3 -c "
import subprocess, sys, os, time

# Install pyodbc isn't available, so we use a simple TCP approach
# The actual schema and data loading will be done by connecting externally
print('SQL Edge started. Schema must be loaded externally.')
" 2>/dev/null

echo "MSSQL container ready. Connect externally to load schema."

# Wait for SQL Server process
wait $MSSQL_PID
