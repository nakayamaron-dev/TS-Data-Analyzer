var user = {
  user: "mongo",
  pwd: "mongo",
  roles: [
    {
      role: "dbOwner",
      db: "data"
    }
  ]
};

db.createUser(user);
db.createCollection('plotinfo');