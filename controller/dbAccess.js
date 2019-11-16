require('dotenv').config();
//const CryptoJS = require('crypto-js');
let Database = require('./async-db');

//  1. Post new consumer
//  2. Post new agent
//  3. Post new bid
//  4. Post new listing
//  5. Update bid
//  6. Update listing
//  7. Get all active listings
//  8. Get all bids
//  9. Get all bids for a listing owned by a customer_id
// 10. Get all booked bids for agent
// 11. Get all bids on a listing

class DBAccess {
  constructor() {
    try {
      if (process.env.JAWSDB_URL) {
        this.db = new Database(process.env.JAWSDB_URL);
      } else {
        this.db = new Database({
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: process.env.SQL_PASSWORD,
          database: 'trusl'
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getAgents() {
    let query = 'SELECT users.id, users.first_name, users.last_name, users.display_name, users.email, agents.phone, agents.license, agents.title, agents.web_site from (users INNER JOIN agents ON users.agent_id = agents.id)';
    const rows = await this.db.query(query);
    return rows;
  }

  async getAgentWithId(id) {
    let query = 'SELECT users.id, users.first_name, users.last_name, users.display_name, users.email, agents.phone, agents.license, agents.title, agents.web_site from (users INNER JOIN agents ON users.agent_id = agents.id) WHERE users.id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async getUserWithId(id) {
    let query = 'SELECT * FROM users WHERE users.id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async getUsers() {
    let query = 'SELECT * from users';
    const rows = await this.db.query(query);
    return rows;
  }

  async deleteAgent(id) {
    let query = 'DELETE FROM agents WHERE id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async deleteUser(id) {
    let query = 'DELETE FROM users WHERE id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async deleteBid(id) {
    let query = 'DELETE FROM bids WHERE id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async deleteListing(id) {
    let query = 'DELETE FROM listings WHERE id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async updateAgent(id, newAgent) {
    let query = 'UPDATE agents SET license=?, first_name=?, last_name=?, email=?, phone=?, web_site=? WHERE id=?';
    let args = [newAgent.license, newAgent.first_name, newAgent.last_name, newAgent.email, newAgent.phone, newAgent.web_site, id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async updateUser(id, newUser) {
    let query = 'UPDATE users SET display_name=?, first_name=?, last_name=?, email=? WHERE id=?';
    let args = [newUser.display_name, newUser.first_name, newUser.last_name, newUser.email, id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  // If the user's email is found, and if their entered password matches what is
  // stored, then return the id of the user. Otherwise return -1.
  async verifyPassword(email, password) {
    // First, find the user with the given email address and get their id
    let query = 'SELECT id FROM users WHERE email=?';
    let args = [email];
    let rows = await this.db.query(query, args);

    // If no such email exists, return an empty array
    if(rows.length === 0) {
      return {user_id: -1, agent_id: null, display_name: ""};
    }

    let id = rows[0].id;
    query = 'SELECT password, agent_id, display_name FROM users WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    let cipher = this.encrypt(password);
    let agent_id = (rows[0].agent_id == "null") ? null : rows[0].agent_id;
    if (rows[0].password === cipher) {
      return {user_id: id, agent_id: agent_id, display_name: rows[0].display_name};
    } else {
      return {user_id: -1, agent_id: null, display_name: ""};
    }
  }

  //  1. Post new user
  async createUser(consumerInfo) {
    // INSERT INTO consumers (display_name, first_name, last_name, email) VALUES
    // ("Sleepless_in_Toronto", "Annie", "Reed", "anniereed@fake.com");
    let query = 'INSERT INTO users (display_name, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)';
    let cipher = this.encrypt(consumerInfo.password);
    let args = [
      consumerInfo.display_name,
      consumerInfo.first_name,
      consumerInfo.last_name,
      consumerInfo.email,
      cipher
    ];
    let rows = await this.db.query(query, args);

    // Number of rows affected isn't the created consumer. Return the new consumer.
    // We want to retrieve the last consumer created.
    //   1. First get the max id in the table.
    //   2. Then return the consumer with that id.
    query = 'SELECT MAX(id) as id FROM users';
    rows = await this.db.query(query);
    const id = rows[0].id;
    query = 'SELECT * FROM users WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    return { user_id: rows[0]};
  }

  encrypt(password) {
//    return CryptoJS.AES.encrypt(password, 'This should be random').toString();
    // For some reason CryptoJS generates a different hash for the same password. It makes verifying
    // the user's password impossible. Go back to plain text password storage for now and debug this later.
    return password;
  }

  //  2. Post new agent
  async createAgent(agentInfo) {
    // INSERT INTO agents (license, first_name, last_name, email, phone, web_site)
    //    VALUES (123456789, "Abby", "Banksy", "abbybanksy@broker.ca", "416-123-4567", "https://www.abbybanksy.com");
    let query = 'INSERT INTO agents (license, phone, web_site, title) VALUES (?, ?, ?, ?)';
    let args = [
      agentInfo.license,
      agentInfo.phone,
      agentInfo.web_site,
      agentInfo.title
    ];
    let rows = await this.db.query(query, args);

    // Number of rows affected isn't the created consumer. Return the new consumer.
    // We want to retrieve the last consumer created.
    //   1. First get the max id in the table.
    //   2. Then return the consumer with that id.
    query = 'SELECT MAX(id) as id FROM agents';
    rows = await this.db.query(query);
    const agent_id = rows[0].id;


    // To link the agent info to the user info, we need the agent's id
    query = 'INSERT INTO users (display_name, first_name, last_name, email, password, agent_id) VALUES (?, ?, ?, ?, ?, ?)';
    let cipher = this.encrypt(agentInfo.password);
    args = [
      agentInfo.display_name,
      agentInfo.first_name,
      agentInfo.last_name,
      agentInfo.email,
      cipher,
      agent_id
    ];
    await this.db.query(query, args); // execute the query to insert it but we need to return all data, not just user data

    query = 'SELECT MAX(id) as id FROM users';
    rows = await this.db.query(query);
    const user_id = rows[0].id;
    rows = await this.getAgentWithId(user_id);
    return rows[0];
  }

  //  3. Post new bid
  async createBid(bidInfo) {
    // console.log(bidInfo);
    // INSERT INTO bids (agent_id, listing_id, bid_status, services, message)
    //    VALUES (2, 1, "Active", "f", "Hire me because I am your mother.");
    let query = 'INSERT INTO bids (agent_id, listing_id, bid_status, services, message) VALUES (?, ?, ?, ?, ?)';
    let args = [
      bidInfo.agent_id,
      bidInfo.listing_id,
      bidInfo.bid_status,
      bidInfo.services,
      bidInfo.message
    ];
    let rows = await this.db.query(query, args);
    // Number of rows affected isn't the created consumer. Return the new consumer.
    // We want to retrieve the last consumer created.
    //   1. First get the max id in the table.
    //   2. Then return the consumer with that id.
    query = 'SELECT MAX(id) as id FROM bids';
    rows = await this.db.query(query);
    const id = rows[0].id;
    query = 'SELECT * FROM bids WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    return rows[0];
  }

  //  4. Post new listing
  async createListing(listingInfo) {
    // INSERT INTO listings (poster_id, property_address, listing_status, estimated_value,
    // transaction_type) VALUES (1, "E02", "Active", 1000000, "b");
    let query = 'INSERT INTO listings (poster_id, property_address, listing_status, estimated_value, type_of_home) VALUES (?, ?, ?, ?, ?)';
    let args = [
      listingInfo.poster_id,
      listingInfo.property_address,
      listingInfo.listing_status,
      listingInfo.estimated_value,
      listingInfo.type_of_home
    ];
    let rows = await this.db.query(query, args);
    // Number of rows affected isn't the created consumer. Return the new consumer.
    // We want to retrieve the last consumer created.
    //   1. First get the max id in the table.
    //   2. Then return the consumer with that id.
    query = 'SELECT MAX(id) as id FROM listings';
    rows = await this.db.query(query);
    const id = rows[0].id;
    query = 'SELECT * FROM listings WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    return rows[0];
  }

  async getLastUserCreated() {
    let query = 'SELECT MAX(id) as id FROM users';
    let rows = await this.db.query(query);
    const user_id = rows[0].id;
    rows = await this.getUserWithId(user_id);
    return rows[0];
  }

  //  5. Update bid
  async updateBidStatus(id, bidStatus) {
    // UPDATE bids SET bid_status="Booked" WHERE id=4;
    let query = 'UPDATE bids SET bid_status=? WHERE id=?';
    let args = [bidStatus, id];
    let rows = await this.db.query(query, args);

    // Return the updated Bid
    query = 'SELECT * FROM bids WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    // console.log("dbAccess updateBidStatus");
    // console.log(rows[0]);
    return rows[0];
  }

  async updateBidOptions(id, services, message) {
    // UPDATE bids SET bid_status="Booked" WHERE id=4;
    let query = 'UPDATE bids SET bid_status="Active", services=?, message=? WHERE id=?';
    let args = [services, message, id];
    let rows = await this.db.query(query, args);

    // Return the updated Bid
    query = 'SELECT * FROM bids WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    // console.log("dbAccess updateBidStatus");
    // console.log(rows[0]);
    return rows[0];
  }


  async updateBidRejected(id, rejectionReason) {
    // console.log("dbAccess updateBidRejected " + id + " " + rejectionReason)
    // UPDATE bids SET bid_status="Booked" WHERE id=4;
    let query = 'UPDATE bids SET rejection_reason=?, bid_status="Rejected" WHERE id=?';
    let args = [rejectionReason, id];
    let rows = await this.db.query(query, args);

    // Return the updated Bid
    query = 'SELECT * FROM bids WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    return rows[0];
  }


  //  6. Update listing
  async updateListingStatus(id, listingStatus) {
    // UPDATE listings SET listing_status="Signed" WHERE id=3;
    let query = 'UPDATE listings SET listing_status=? WHERE id=?';
    let args = [listingStatus, id];
    let rows = await this.db.query(query, args);

    // Retun the updated listing
    query = 'SELECT * FROM listings WHERE id=?';
    args = [id];
    rows = await this.db.query(query, args);
    return rows[0];
  }

  async getBidsForUserWithId(id) {
    // SELECT * from bids where poster_id = ?
    let query = 'SELECT * from bids where poster_id = ?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async getListingsWithId(id) {
    // SELECT * from listings where id = ?
    let query = 'SELECT * from listings where id = ?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  // Called from the dashboard
  async getListingsForUser(user_id, user_type) {
    if(user_type === 'agent') {
      // If the user is an agent, we need to show them the listings where
      // their bid is the accepted bid and any listings that they can bid on.
      // SELECT listings.* from (bids INNER JOIN listings ON bids.listing_id = listings.id) WHERE bids.bid_status='Signed' AND bids.agent_id=1;
      let query = "SELECT DISTINCT listings.* from (bids INNER JOIN listings ON bids.listing_id = listings.id) WHERE (bids.bid_status='Signed' AND bids.agent_id=?)";
      let args = [user_id];
      const bidRows = await this.db.query(query, args);

      query = "SELECT DISTINCT * FROM listings WHERE listings.listing_status='Active'";
      const listingRows = await this.db.query(query);

      const rows = bidRows.concat(listingRows);

      // console.log("dbAccess getListingsForUser");
      // console.log(query);
      // console.log("this works in SQL workbench");
      // console.log("SELECT DISTINCT listings.* from (bids INNER JOIN listings ON bids.listing_id = listings.id) WHERE (bids.bid_status='Signed' AND bids.agent_id=?) OR listings.listing_status='Active'")
      // console.log(rows);

      return rows;
    } else if(user_type === 'consumer') {
      let query = 'SELECT * from listings where poster_id = ?';
      let args = [user_id];
      const rows = await this.db.query(query, args);
      return rows;
    } else {
      return [];
    }
  }

  async getBidsForAgentWithIdActiveOrRejected(agent_id) {
    // SELECT listings.*, bids.bid_status from (bids INNER JOIN listings ON bids.listing_id = listings.id) WHERE (bids.bid_status="Active" OR bids.bid_status="Rejected") AND bids.agent_id=?;
    let query = 'SELECT listings.*, bids.* from (bids INNER JOIN listings ON bids.listing_id = listings.id) WHERE (bids.bid_status="Active" OR bids.bid_status="Rejected") AND bids.agent_id=?;';
    let args = [agent_id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  //  7. Get all active listings
  async getListings(listingStatus) {
    // console.log('getListings with parameter ' + listingStatus);
    let query = '';
    let rows = '';
    if (listingStatus === undefined) {
      query = 'SELECT * from listings';
      // console.log(query);
      rows = await this.db.query(query);
    } else {
      // SELECT * from listings WHERE listing_status = ?
      query = 'SELECT * from listings WHERE listing_status = ?';
      // console.log(query);
      let args = [listingStatus];
      rows = await this.db.query(query, args);
    }
    // console.log("dbAccess rows are");
    // console.log(rows);
    return rows;
  }

  //  8. Get all bids
  async getBids() {
    // SELECT * from bids;
    let query = 'SELECT * from bids';
    const rows = await this.db.query(query);
    return rows;
  }

  async getBidWithId(id) {
    // SELECT * from bids WHERE id=1;
    let query = 'SELECT * FROM bids WHERE id=?';
    let args = [id];
    const rows = await this.db.query(query, args);
    return rows;
  }

  //  9. Get all bids for a listing
  async getBidsWithStatus(bidStatus) {
    // SELECT * from bids WHERE listing_status = ?
    let query = 'SELECT * from bids WHERE bid_status = ?';
    let args = [bidStatus];
    const rows = await this.db.query(query, args);
    return rows;
  }

  // Get booked bids for an agent. (Could be active or closed too.)
  // 10. Get all booked bids for agent
  async getBidsForAgentWithStatus(agentId, bidStatus) {
    // SELECT * FROM bids WHERE bid_status="Active" AND agent_id="1";
    let query = 'SELECT * FROM bids WHERE bid_status="?" AND agent_id="?"';
    let args = [bidStatus, agentId];
    const rows = await this.db.query(query, args);
    return rows;
  }

  async getBidsAndAgentNameWithBidId(bidId) {
    let query = 'SELECT bids.*, users.first_name, users.last_name from (bids INNER JOIN users ON bids.agent_id = users.agent_id) WHERE bids.id=?';
    let args = [bidId];
    const rows = await this.db.query(query, args);
    return rows;
  }

  // 11. Get all bids on a listing
  async getBidsForListing(listingId) {
    // SELECT * from bids WHERE listing_id=3;
    let query = 'SELECT bids.*, users.first_name, users.last_name from (bids INNER JOIN users ON bids.agent_id = users.agent_id) WHERE listing_id=?';
    let args = [listingId];
    const rows = await this.db.query(query, args);
    return rows;
  }

  // These functions are convenience methods to convert the cryptic table column value
  // into the actual value that the user chose. Only this class needs to use this method.
  static convertTransactionType(transaction) {
    // ENUM("Rent", "Buy", "Sell", "Rent out"),
    let transactionArray = [];
    if (transaction.indexOf('a') >= 0) {
      // option a was selected
      transactionArray.push('Rent');
    }

    if (transaction.indexOf('b') >= 0) {
      // option b selected
      transactionArray.push('Buy');
    }

    // Isn't there a way to declare an array with named indices?
    if (transaction.indexOf('c') >= 0) {
      // option b selected
      transactionArray.push('Sell');
    }

    if (transaction.indexOf('d') >= 0) {
      // option b selected
      transactionArray.push('Rent out');
    }
    return transactionArray;
  }

  async close() {
    await this.db.close();
  }
}

module.exports = DBAccess;