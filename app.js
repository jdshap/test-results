const express = require('express');
const router = express.Router();
const db = require('diskdb');
const fs = require('fs');

const startserver = (config) => {
    const app = express();
    router.use(express.json());

    // Connect to diskdb database
    const dbPath = config.databasePath || 'db';
    const dbName = config.databaseName || 'default';
    db.connect(dbPath, [dbName]);

    /*
     *  GET method
     *  @query-string secondsAgo - filter results by timestamp recency
     */
    router.get('/testresults', (req, res) => {
        let data = db[dbName].find();

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
        let data = db[dbName].find({package: req.params.package});

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
        let data = db[dbName].find({package: req.params.package, id: req.params.id});

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
        db[dbName].save(result);
        res.send(result);
    });

    /*
     *  DELETE method
     *  Backs up database, then clears it.
     */
    router.delete('/testresults', (req, res) => {
        if(db[dbName].find().length !== 0) {
            const backupName = `${dbPath}/backup-${Date.now()}`;
            const json = JSON.stringify(db[dbName].find());
            fs.writeFileSync(backupName, json, 'utf8');
            db[dbName].remove();
            db.connect(dbPath, [dbName]);
            res.send({message: 'Database is already empty', backup: backupName});
        } else res.send({message: 'Database is already empty', backup: ''});
    });

    const contextPath = config.contextPath || '/';
    const port = config.port || 3000;

    app.use(contextPath, router);
    const server = app.listen(port, () => console.log(`Listening on port ${port}...`))
    return { server, contextPath}
}
module.exports = {startserver};