# 1. Setup two DBs

# 2. Setup Replication:

## 1. Configure the Primary Database Server:

### 1. Open the postgresql.conf file in a text editor: vi /usr/local/var/postgres/postgresql.conf

#### Add:

wal_level = replica
max_wal_senders = 3
max_replication_slots = 2

### 2. Edit pg_hba.conf:

vi /opt/homebrew/var/postgresql@14/pg_hba.conf

#### Add a line to allow replication from the local machine:

host replication all 127.0.0.1/32 md5

### 3. Restart PostgreSQL:

brew services restart postgresql@14

## 2. Configure the Secondary Database Server:

### 1. Create a new data directory for the secondary server:

      mkdir /opt/homebrew/var/postgresql_secondary

### 2. Use pg_basebackup to clone the primary server data to the new secondary data directory:

      pg_basebackup -h localhost -D /opt/homebrew/var/postgresql_secondary -U replication_user -vP -W

### 3. Set Up Standby Mode:

#### Create a standby.signal file in the secondary’s data directory:

      touch /opt/homebrew/var/postgresql_secondary/standby.signal

#### Append the necessary connection information to the secondary's postgresql.conf:

      echo "primary_conninfo = 'host=localhost port=5432 user=replication_user password=yourpassword'" >> /opt/homebrew/var/postgresql_secondary/postgresql.conf

### 4. You need to run the secondary PostgreSQL server on a different port to avoid conflicts with the primary server:

      /opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgresql_secondary -p 5433

# 3. Verify Replication:

### 1. Check the replication status on the primary:

#### Connect to the primary database and run:

      SELECT * FROM pg_stat_replication;
