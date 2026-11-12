-- ====================================================================
-- RoadAssist - Seed Data
-- ====================================================================

USE roadassist;

-- Clear previous data in correct order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE provider_availability;
TRUNCATE TABLE reviews;
TRUNCATE TABLE request_updates;
TRUNCATE TABLE assistance_requests;
TRUNCATE TABLE services;
TRUNCATE TABLE providers;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Password for all seed users is: Password@123
-- Hash: $2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2

-- 1. Insert Users
INSERT INTO users (id, name, email, password_hash, phone, role, status, emergency_contact_name, emergency_contact_phone) VALUES
(1, 'System Administrator', 'admin@roadassist.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9900011122', 'admin', 'active', 'Operations Lead', '+91 9900011123'),
(2, 'Rahul Sharma', 'rahul@gmail.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9876543210', 'customer', 'active', 'Pooja Sharma', '+91 9876543211'),
(3, 'Priya Patel', 'priya@gmail.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9812345678', 'customer', 'active', 'Karan Patel', '+91 9812345679'),
(4, 'Vikram Malhotra', 'quickfix@roadassist.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9848012345', 'provider', 'active', NULL, NULL),
(5, 'Suresh Reddy', 'apex@roadassist.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9848023456', 'provider', 'active', NULL, NULL),
(6, 'Mohammed Arif', 'citytyre@roadassist.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9848034567', 'provider', 'active', NULL, NULL),
(7, 'David John', 'speedshield@roadassist.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9848045678', 'provider', 'active', NULL, NULL),
(8, 'Rajesh Varma', 'metro@roadassist.com', '$2b$10$RDjwqgTxw5/pvKtreGdv/.1vMzMXfE.DsRDiQ7nSX2eUGXLizt/G2', '+91 9848056789', 'provider', 'active', NULL, NULL);

-- 2. Insert Vehicles
INSERT INTO vehicles (id, user_id, make, model, year, registration_number, vehicle_type, color, is_default) VALUES
(1, 2, 'Hyundai', 'Creta SX(O)', 2023, 'TS09EA4589', 'SUV', 'Polar White', TRUE),
(2, 2, 'Honda', 'Activa 6G', 2022, 'TS08HG7712', 'Motorcycle', 'Matte Axis Grey', FALSE),
(3, 3, 'Maruti Suzuki', 'Swift ZXi', 2021, 'TS07FD9821', 'Hatchback', 'Fire Red', TRUE);

-- 3. Insert Providers
INSERT INTO providers (id, user_id, business_name, owner_name, phone, address, city, latitude, longitude, services_offered, operating_hours, base_charge, per_km_charge, is_available, verification_status, rating, total_ratings, total_services_completed, total_earnings) VALUES
(1, 4, 'QuickFix Auto Rescue', 'Vikram Malhotra', '+91 9848012345', 'Road No 36, Madhapur, Hitec City', 'Hyderabad', 17.44850000, 78.37480000, '["Flat Tyre", "Battery Failure", "Engine Failure", "Fuel Shortage", "Overheating", "Other Mechanical Issues"]', '24/7 Always Open', 350.00, 25.00, TRUE, 'verified', 4.90, 84, 128, 48600.00),
(2, 5, 'Apex 24x7 Roadside & Towing', 'Suresh Reddy', '+91 9848023456', 'ORR Junction, Gachibowli', 'Hyderabad', 17.44010000, 78.34890000, '["Flat Tyre", "Battery Failure", "Accident", "Engine Failure", "Overheating"]', '24/7 Fast Response', 400.00, 30.00, TRUE, 'verified', 4.80, 62, 95, 41200.00),
(3, 6, 'City Tyre & Battery Express', 'Mohammed Arif', '+91 9848034567', 'Kothaguda X Roads, Kondapur', 'Hyderabad', 17.46220000, 78.35680000, '["Flat Tyre", "Battery Failure", "Fuel Shortage"]', '06:00 AM - 11:30 PM', 280.00, 20.00, TRUE, 'verified', 4.75, 48, 82, 27500.00),
(4, 7, 'SpeedShield Emergency Mechanics', 'David John', '+91 9848045678', 'Rd 10, Jubilee Hills', 'Hyderabad', 17.43190000, 78.40730000, '["Engine Failure", "Overheating", "Accident", "Battery Failure", "Flat Tyre", "Other Mechanical Issues"]', '24/7 Rapid Squad', 450.00, 28.00, TRUE, 'verified', 4.95, 96, 140, 62400.00),
(5, 8, 'Metro Road Doctors', 'Rajesh Varma', '+91 9848056789', 'Phase 4, Kukatpally', 'Hyderabad', 17.49380000, 78.39950000, '["Flat Tyre", "Engine Failure", "Fuel Shortage"]', '08:00 AM - 10:00 PM', 300.00, 22.00, TRUE, 'pending', 4.50, 6, 8, 2400.00);

-- 4. Insert Provider Availability
INSERT INTO provider_availability (provider_id, is_online, current_latitude, current_longitude) VALUES
(1, TRUE, 17.44850000, 78.37480000),
(2, TRUE, 17.44010000, 78.34890000),
(3, TRUE, 17.46220000, 78.35680000),
(4, TRUE, 17.43190000, 78.40730000),
(5, TRUE, 17.49380000, 78.39950000);

-- 5. Insert Services Catalog
INSERT INTO services (id, name, category, description, base_price, estimated_duration_mins, icon) VALUES
(1, 'Flat Tyre Repair & Replacement', 'Flat Tyre', 'Puncture plugging, air inflation, or mounting the spare wheel on the spot.', 299.00, 25, 'Disc'),
(2, '12V Battery Jump-Start', 'Battery Failure', 'Heavy-duty jumper cables or portable booster pack startup with alternator check.', 349.00, 20, 'Zap'),
(3, 'Emergency Fuel Delivery (5 Litres)', 'Fuel Shortage', 'Delivery of 5 Litres pure Petrol or Diesel directly to your stranded spot.', 450.00, 30, 'Fuel'),
(4, 'Engine Diagnostic & Minor Fix', 'Engine Failure', 'On-spot scan tool diagnostic, belt check, ignition troubleshooting and temporary bypass.', 599.00, 45, 'Wrench'),
(5, 'Coolant Flush & Overheat Rescue', 'Overheating', 'Coolant top-up, fan sensor inspection, radiator hose leakage check.', 499.00, 35, 'Thermometer'),
(6, 'Accident Recovery & Flatbed Towing', 'Accident', 'Secure hydraulic towing to the nearest authorized service center or workshop.', 1199.00, 60, 'Truck'),
(7, 'General Mechanical Breakdown', 'Other Mechanical Issues', 'Clutch cable, brake fluid check, starter motor inspection and mechanical roadside repair.', 499.00, 40, 'Tool');

-- 6. Insert Assistance Requests (Past completed & ongoing)
INSERT INTO assistance_requests (id, request_code, customer_id, provider_id, vehicle_id, category, description, image_url, latitude, longitude, address, status, estimated_cost, final_cost, payment_status, created_at) VALUES
(1, 'REQ-1001', 2, 1, 1, 'Flat Tyre', 'Rear right tyre suffered a puncture on Inorbit Mall flyover. Need urgent puncture repair.', NULL, 17.43650000, 78.38450000, 'Inorbit Mall Road, Madhapur, Hyderabad', 'completed', 450.00, 450.00, 'paid', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 'REQ-1002', 3, 2, 3, 'Battery Failure', 'Car engine won not crank after parking at Mindspace. Clicking noise heard.', NULL, 17.44180000, 78.38040000, 'Mindspace Cybercity, Madhapur, Hyderabad', 'completed', 520.00, 520.00, 'paid', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'REQ-1003', 2, 4, 1, 'Engine Failure', 'Car suddenly stalled near Jubilee Hills checkpost with check engine light flashing.', NULL, 17.43000000, 78.41100000, 'Road No 1, Jubilee Hills Checkpost, Hyderabad', 'in_progress', 750.00, 750.00, 'pending', NOW());

-- 7. Insert Request Updates Audit Trail
INSERT INTO request_updates (request_id, status, notes, updated_by, created_at) VALUES
(1, 'pending', 'Assistance request logged by customer.', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'accepted', 'QuickFix Auto Rescue accepted the request.', 4, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'on_the_way', 'Technician dispatched with puncture kit.', 4, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'in_progress', 'Technician arrived and plugging tyre puncture.', 4, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'completed', 'Tyre fixed and pressure equalized. Payment collected.', 4, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'pending', 'Assistance request created by Rahul Sharma.', 2, DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(3, 'accepted', 'SpeedShield Emergency Mechanics confirmed request.', 7, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(3, 'on_the_way', 'Lead mechanic dispatched on rescue vehicle.', 7, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(3, 'in_progress', 'Mechanic arrived on site. Running OBD-II diagnostics.', 7, DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- 8. Insert Reviews
INSERT INTO reviews (id, request_id, customer_id, provider_id, rating, comment, created_at) VALUES
(1, 1, 2, 1, 5, 'QuickFix arrived within 15 minutes! The technician Vikram was polite and repaired the puncture safely on the flyover shoulder. Highly recommended!', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 3, 2, 5, 'Apex Towing jump-started my Swift in under 10 minutes. Super professional staff and transparent pricing.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 9. Insert Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 2, 'Service Completed', 'Your Flat Tyre assistance request REQ-1001 was completed successfully.', 'request_update', TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 'Provider Dispatched', 'SpeedShield Emergency Mechanics is on the way to your breakdown location for REQ-1003.', 'request_update', FALSE, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(3, 1, 'New Provider Registration', 'Metro Road Doctors has registered and is awaiting admin verification.', 'verification', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR));
