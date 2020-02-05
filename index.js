// Load all the required libraries
const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const uuid = require('uuid');

// Load fake database
const db = require('./data/restaurant');

// Create an instance of express application
const app = express();

// Log all incoming requests
app.use(morgan('tiny'))

// Set CORS headers
app.use(cors())

// GET /api/resturants?offset=num&limit=num - get a list of 10 restaurents
app.get(
    '/api/restaurents', 
    (req, resp) => {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const result = db.slice(offset, offset + limit)
            .map(v => {
                return {
                    id: v._id.$oid,
                    name: v.name
                }
            })

        resp.status(200)
        resp.type('application/json')
        resp.json({
            offset,
            limit,
            result,
            timestamp: (new Date()).toString()
        });
    }
)

// POST /api/restaurent
app.post(
    '/api/restaurent',
    express.urlencoded({ extended: true }),
    (req, resp) => {
        const id = uuid().replace(/-/g, '')
        const name = req.body.name;
        const address = req.body.address;

        const newRecord = {
            _id: { $oid: id },
            name: name,
            address: address
        }
        db.unshift(newRecord);

        resp.status(201)
        resp.type('application/json')
        resp.json(id)
    }
)

// GET /api/restaurent/<id>
app.get(
    '/api/restaurent/:rId',
    (req, resp) => {
        const rId = req.params.rId;
        const result = db.find(v => (v._id.$oid == rId));

        if (result) {
            resp.status(200)
            resp.type('application/json')
            resp.json(result)
        } else {
            resp.status(404)
            resp.type('application/json')
            resp.json({ message: `key not found ${rId}`} )
        }
    }
)

app.use(
    (req, resp) => {
        resp.status(404)
        resp.type('application/json')
        resp.json( {message: `resource not found ${req.originalUrl}`})
    }
)

// Start the express server
const PORT = parseInt(process.env.PORT) || 3000;

app.listen(PORT,
    () => { console.info(`Application started on part ${PORT} at ${new Date()}`); }
)

