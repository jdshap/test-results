const express = require('express');
const db = require('diskdb');

const app = express();
app.use(express.json());

db.connect('db', ['responses']);

app.get('/testresults', (req, res) => {
    let data = db.responses.find();
    if(req.query.secondsAgo) {
        const temp = JSON.parse(JSON.stringify(data));
        data.length = 0;
        temp.map(o => {
            if(Date.now() - o.timestamp <= parseInt(req.query.secondsAgo) * 1000) data.push(o);
        }, []);
    }
    console.log(data);
    res.send(data);
});

app.get('/testresults/:package/', (req, res) => {
    let data = db.responses.find({package: req.params.package});
    if(req.query.secondsAgo) {
        const temp = JSON.parse(JSON.stringify(data));
        data.length = 0;
        temp.map(o => {
            if(Date.now() - o.timestamp <= parseInt(req.query.secondsAgo) * 1000) data.push(o);
        }, []);
    }
    res.send(data);
});

app.get('/testresults/:package/:id', (req, res) => {
    let data = db.responses.find({package: req.params.package, id: parseInt(req.params.id)});
    if(req.query.secondsAgo) {
        const temp = JSON.parse(JSON.stringify(data));
        data.length = 0;
        temp.map(o => {
            if(Date.now() - o.timestamp <= parseInt(req.query.secondsAgo) * 1000) data.push(o);
        }, []);
    }
    res.send(data);
});

app.post('/testresults', (req, res) => {
    let result = {
        package: req.body.package,
        id: req.body.id,
        numPass: req.body.numPass,
        numFail: req.body.numFail,
        elapsedTime: req.body.elapsedTime,
        timestamp: Date.now()
    };
    db.responses.save(result);
    res.send(result);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));