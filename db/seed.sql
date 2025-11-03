-- Seed data for ASPATRANS (2-3 rows per table)
-- Uses explicit IDs for simple predictable references

-- Clear existing (order matters due to FKs)
TRUNCATE TABLE trips, contracts, business_requests, drivers, vehicles, transport_companies, users RESTART IDENTITY CASCADE;

-- Users
INSERT INTO users (id, email, password, role, full_name, phone, company_name)
VALUES
  (1, 'owner@business.ma', '$2b$10$fakehashbusiness', 'business', 'Owner Business', '+212600000001', 'TechCorp'),
  (2, 'admin@aspatrans.ma', '$2b$10$fakehashadmin', 'admin', 'Main Admin', '+212600000002', NULL),
  (3, 'owner@transco.ma', '$2b$10$fakehashtransco', 'transport_company', 'TransCo Owner', '+212600000003', 'TransCo'),
  (4, 'driver1@transco.ma', '$2b$10$fakehashdriver1', 'driver', 'Driver One', '+212600000004', NULL),
  (5, 'driver2@transco.ma', '$2b$10$fakehashdriver2', 'driver', 'Driver Two', '+212600000005', NULL);

-- Transport Companies
INSERT INTO transport_companies (id, name, owner_id, contact_phone, vehicles_count, status)
VALUES
  (1, 'TransCo', 3, '+212620000001', 2, 'active'),
  (2, 'AtlasTransport', 3, '+212620000002', 1, 'pending');

-- Vehicles
INSERT INTO vehicles (id, company_id, plate_number, model, capacity, status, last_maintenance)
VALUES
  (1, 1, 'A-123456', 'Renault Master', 1500, 'active', '2025-06-01'),
  (2, 1, 'B-654321', 'Mercedes Sprinter', 2000, 'inactive', '2025-05-15'),
  (3, 2, 'C-112233', 'Iveco Daily', 1800, 'pending', NULL);

-- Drivers
INSERT INTO drivers (id, company_id, user_id, license_number, availability_status)
VALUES
  (1, 1, 4, 'DRV-MA-0001', 'active'),
  (2, 1, 5, 'DRV-MA-0002', 'inactive');

-- Business Requests
INSERT INTO business_requests (id, business_id, pickup_location, destination, employees_count, frequency, start_date, end_date, special_notes, status)
VALUES
  (1, 1, 'Casablanca - Sidi Maârouf', 'Rabat - Agdal', 25, 'Daily', '2025-11-10', '2026-01-10', 'Morning shift 8:00', 'pending'),
  (2, 1, 'Casablanca - Ain Sebaa', 'Settat - Centre', 10, 'Weekly', '2025-11-15', NULL, 'Fragile equipment', 'active');

-- Contracts
INSERT INTO contracts (id, request_id, company_id, driver_id, vehicle_id, price, admin_notes, status)
VALUES
  (1, 1, 1, 1, 1, 15000.00, 'Priority client', 'pending'),
  (2, 2, 1, 2, 2, 5000.00, 'Trial period', 'active');

-- Trips
INSERT INTO trips (id, contract_id, driver_id, scheduled_datetime, actual_start, actual_end, pickup_lat, pickup_lng, destination_lat, destination_lng, status)
VALUES
  (1, 1, 1, '2025-11-12T08:00:00+00', NULL, NULL, 33.5731, -7.5898, 34.0209, -6.8416, 'pending'),
  (2, 2, 2, '2025-11-13T09:00:00+00', '2025-11-13T09:05:00+00', NULL, 33.6073, -7.5300, 32.2994, -7.6200, 'active');

-- Align sequences to current MAX(id) so future inserts don't collide
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));
SELECT setval('transport_companies_id_seq', (SELECT COALESCE(MAX(id), 0) FROM transport_companies));
SELECT setval('vehicles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM vehicles));
SELECT setval('drivers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM drivers));
SELECT setval('business_requests_id_seq', (SELECT COALESCE(MAX(id), 0) FROM business_requests));
SELECT setval('contracts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM contracts));
SELECT setval('trips_id_seq', (SELECT COALESCE(MAX(id), 0) FROM trips));


