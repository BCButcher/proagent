DROP DATABASE IF EXISTS TRUSL;
CREATE DATABASE TRUSL;
use TRUSL;

CREATE TABLE agent (
   license INTEGER NOT NULL PRIMARY KEY,
   first_name VARCHAR(32),
   last_name VARCHAR(32),
   email VARCHAR(32),
   phone VARCHAR(15),
   web_site VARCHAR(2083)
);

CREATE TABLE consumer (
	id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(32),
    first_name VARCHAR(32),
    last_name VARCHAR(32),
    email VARCHAR(32),
	phone VARCHAR(15)
);

CREATE TABLE listing (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    poster_id INTEGER,
    area VARCHAR(32),
    listing_status ENUM("Active", "Booked", "Closed"),
    money INTEGER,
    transaction_type VARCHAR(4),
    FOREIGN KEY (poster_id) REFERENCES consumer(id)
);

CREATE TABLE bids (
   id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
   agent_id INTEGER,
   listing_id INTEGER,
   bid_status ENUM("Active", "Booked", "Closed"),
   services VARCHAR(8),
   message VARCHAR(500),    
   FOREIGN KEY (agent_id) REFERENCES agent(license),
   FOREIGN KEY (listing_id) REFERENCES listing(id)
);

-- ENUM("Rent", "Buy", "Sell", "Rent out"),
-- ENUM("In-person tours", "Online advertising", "Paint", "Print brochures", "Print advertising", "Staging", "Virtual tours", "Buy your house if you can't sell it"),

