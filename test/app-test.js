const chai = require('chai');
const assert = chai.assert;
const chaiHTTP = require('chai-http');
const app = require('../app');
const server = app.server;
const faker = require('faker');

const contextPath = app.contextPath;

chai.use(chaiHTTP);

const testData = [];
const testPackage = 'test-package';
const testId = 'test-id';
for(var i=0; i<faker.random.number(5)+5; i++) {
    testData.push({
        package: testPackage,
        id: testId,
        numPass: faker.random.number(50),
        numFail: faker.random.number(50),
        elapsedTime: faker.random.number(300)
    });
}
for(var i=0; i<faker.random.number(5)+5; i++) {
    testData.push({
        package: testPackage,
        id: faker.commerce.productName(),
        numPass: faker.random.number(50),
        numFail: faker.random.number(50),
        elapsedTime: faker.random.number(300)
    });
}
for(var i=0; i<faker.random.number(5)+5; i++) {
    testData.push({
        package: faker.system.fileName(),
        id: faker.commerce.productName(),
        numPass: faker.random.number(50),
        numFail: faker.random.number(50),
        elapsedTime: faker.random.number(300)
    });
}
const dbKeys = ['package', 'id', 'numPass', 'numFail', 'elapsedTime', '_id', 'timestamp'];

describe('Test server', function() {

    describe('POST endpoint', function() {

        it('accepts well formed JSON', function() {
            testData.map(data => {
                chai.request(server)
                .post(`${contextPath}testresults`)
                .send(data)
                .end((err, res) => {
                    assert.equal(res.status, 200, 'Server responded 200 ok');
                    assert.hasAllKeys(res.body, dbKeys, 'data correctly entered');
                });
            });
        });

    });

    describe('GET endpoint', function() {

        it('returns all test results', function() {
            chai.request(server)
                .get(`${contextPath}testresults`)
                .end((err, res) => {
                    assert.equal(res.status, 200, 'Server responded 200 ok');
                    assert.isArray(res.body, 'server returns array');
                    assert.equal(res.body.length, testData.length, 'server returned all added objects');
                    res.body.map(o => {
                        assert.hasAllKeys(o, dbKeys, 'server returned test object');
                    });
                });
        });

        it('filters by package', function() {
            chai.request(server)
                .get(`${contextPath}testresults/${testPackage}`)
                .end((err, res) => {
                    assert.equal(res.status, 200, 'Server responded 200 ok');
                    assert.isArray(res.body, 'server returns array');
                    res.body.map(o => {
                        assert.equal(o.package, testPackage, 'server returns only objects with specified package name');
                    });
                });
        });

        it('filters by package and id', function() {
            chai.request(server)
                .get(`${contextPath}testresults/${testPackage}/${testId}`)
                .end((err, res) => {
                    assert.equal(res.status, 200, 'Server responded 200 ok');
                    assert.isArray(res.body, 'server returns array');
                    res.body.map(o => {
                        res.body.map(o => {
                            assert.equal(o.package, testPackage, 'server returns only objects with specified package name');
                            assert.equal(o.id, testId, 'server returns only objects with specified package name');
                        });
                    });
                });
        });
    });

    describe('DELETE endpoint', function() {

        it('clears all results', function() {
            chai.request(server)
                .delete(`${contextPath}testresults`)
                .end((err, res) => {
                    assert.equal(res.status, 200, 'Server responded 200 ok');
                    chai.request(server)
                        .get('/testresults')
                        .end((err, res) => {
                            assert.equal(res.status, 200, 'Server responded 200 ok');
                            assert.isArray(res.body, 'server returns array');
                            assert.equal(res.body.length, 0, 'server returned cleared database');
                        });
                });
        });
    });
});