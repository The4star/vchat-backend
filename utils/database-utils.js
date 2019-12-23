const dbConnection = (err) => {
    if (err) {
        console.log(err);        
    } else {
        console.log('Successfully Connected to DB');        
    }
}

const db = process.env.DB;
const options = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true};

module.exports = {
    dbConnection,
    db,
    options
};