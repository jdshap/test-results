const express = require('express');
const router = express.Router();
const db = require('diskdb');
const fs = require('fs');


const configTemplate = `{
    "contextPath": "",
    "port": ""
}`;
if(!fs.existsSync('./config.json')) fs.writeFile('config.json', configTemplate, 'utf8', (err) => { if (err) throw err });
const config = require('./config');

const app = express();
router.use(express.json());

// Connect to diskdb database "responses"
db.connect('db', ['responses']);

/*
 *  GET method
 *  @query-string secondsAgo - filter results by timestamp recency
 */
router.get('/testresults', (req, res) => {
    let data = db.responses.find();

    //Filter by secondsAgo if defined
    if(req.query.secondsAgo) {
        const temp = JSON.parse(JSON.stringify(data));
        data.length = 0;
        temp.map(o => {
            if(Date.now() - o.timestamp <= parseInt(req.query.secondsAgo) * 1000) data.push(o);
        }, []);
    }
    
    res.send(data);
});

/*
 *  GET method
 *  @route-parameter package - filters by specified package value
 *  @query-string secondsAgo - filter results by timestamp recency
 */
router.get('/testresults/:package/', (req, res) => {
    let data = db.responses.find({package: req.params.package});

    //Filter by secondsAgo if defined
    if(req.query.secondsAgo) {
        const temp = JSON.parse(JSON.stringify(data));
        data.length = 0;
        temp.map(o => {
            if(Date.now() - o.timestamp <= parseInt(req.query.secondsAgo) * 1000) data.push(o);
        }, []);
    }

    res.send(data);
});

/*
 *  GET method
 *  @route-parameter package - filters by specified package value
 *  @route-parameter id - filters by specified id value (Not database _id hash)
 *  @query-string secondsAgo - filter results by timestamp recency
 */
router.get('/testresults/:package/:id', (req, res) => {
    let data = db.responses.find({package: req.params.package, id: req.params.id});

    //Filter by secondsAgo if defined
    if(req.query.secondsAgo) {
        const temp = JSON.parse(JSON.stringify(data));
        data.length = 0;
        temp.map(o => {
            if(Date.now() - o.timestamp <= parseInt(req.query.secondsAgo) * 1000) data.push(o);
        }, []);
    }

    res.send(data);
});

/*
 *  POST method
 */
router.post('/testresults', (req, res) => {
    let result = {
        package: req.body.package,
        id: req.body.id,
        numPass: req.body.numPass,
        numFail: req.body.numFail,
        elapsedTime: parseInt(req.body.elapsedTime),
        timestamp: Date.now()
    };
    db.responses.save(result);
    res.send(result);
});

/*
 *  DELETE method
 *  Backs up database, then clears it.
 */
router.delete('/testresults', (req, res) => {
    const json = JSON.stringify(db.responses.find());
    fs.writeFile(`db/backup-${Date.now()}`, json, 'utf8', (err) => { if (err) throw err });
    db.responses.remove();
    db.connect('db', ['responses']);
    res.send('DELETE complete');
});

const contextPath = config.contextPath || "/";
const port = config.port || 3000;

app.use(contextPath, router);
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
module.exports = {server, contextPath};