// Generated by CoffeeScript 1.6.3
(function() {
  var CUSTOMERS, app, assert, base_url, connect, express, freeport, querystring, slumber, url;

  querystring = require('querystring');

  url = require('url');

  assert = require('assert');

  express = require('express');

  connect = require('connect');

  freeport = require('freeport');

  slumber = require('..');

  base_url = 'http://www.example.com/';

  CUSTOMERS = {
    1: {
      user: 'Alfred',
      gender: 'male',
      age: 24
    },
    2: {
      user: 'George',
      gender: 'male',
      age: 42
    },
    3: {
      user: 'Cynthia',
      gender: 'female',
      age: 28
    }
  };

  app = express();

  app.use(connect.urlencoded());

  app.use(connect.json());

  app.get('/', function(req, res) {
    return res.end('Hello World !');
  });

  app.get('/customers', function(req, res) {
    var customer, customer_id, filter_key, filter_value, ok, query, ret, url_parts;
    url_parts = url.parse(req.url);
    query = querystring.parse(url_parts.query);
    ret = [];
    for (customer_id in CUSTOMERS) {
      customer = CUSTOMERS[customer_id];
      ok = true;
      for (filter_key in query) {
        filter_value = query[filter_key];
        if (customer[filter_key] !== filter_value) {
          ok = false;
          break;
        }
      }
      if (ok) {
        ret.push(customer_id);
      }
    }
    return res.json(ret);
  });

  app.post('/test-post', function(req, res) {
    return res.json({
      'parsed-body': req.body
    });
  });

  app.put('/test-put', function(req, res) {
    return res.json({
      'parsed-body': req.body
    });
  });

  app.patch('/test-patch', function(req, res) {
    return res.json({
      'parsed-body': req.body
    });
  });

  app.get('/customers-yml', function(req, res) {
    var yamljs;
    yamljs = require('yamljs');
    return res.end(yamljs.stringify(CUSTOMERS));
  });

  app.get('/customers-yml-with-header', function(req, res) {
    var yamljs;
    yamljs = require('yamljs');
    res.header('Content-Type', 'text/yaml');
    return res.end(yamljs.stringify(CUSTOMERS));
  });

  app.get('/customers/:id', function(req, res) {
    return res.json(CUSTOMERS[parseInt(req.params.id)]);
  });

  describe('Routing', function() {
    var api;
    api = slumber.API(base_url, {});
    describe('#base_url', function() {
      return it('should retrieve a string with base_url of api', function() {
        return assert.equal(api.base_url, base_url);
      });
    });
    describe('one child', function() {
      return it('should retrieve a string with base_url of api with 1 child', function() {
        return assert.equal(api('customers').base_url, "" + base_url + "customers/");
      });
    });
    return describe('two children', function() {
      return it('should retrieve a string with base_url of api with 2 children', function() {
        return assert.equal(api('customers')(42).base_url, "" + base_url + "customers/42/");
      });
    });
  });

  describe('Serializer', function() {
    describe('serializer', function() {
      var api;
      api = slumber.API(base_url, {});
      it('should be an object', function() {
        return assert.equal('object', typeof api.serializer);
      });
      describe('#serializers', function() {
        return it('should return an array of available serializers', function() {
          return assert.equal('object', typeof api.serializer.serializers);
        });
      });
      describe('#get_serializer()', function() {
        return it('should return the default serializer', function() {
          var serializer;
          serializer = api.serializer.get_serializer();
          assert.equal('object', typeof serializer);
          return assert.equal('json', serializer.key);
        });
      });
      describe('#get_by_name', function() {
        return it('should return the best serializer depending on name', function() {
          return assert.equal('yaml', api.serializer.get_serializer('yaml').key);
        });
      });
      return describe('#get_by_content_type', function() {
        return it('should return the best serializer depending on content-type', function() {
          var k, mapping, v, _results;
          mapping = {
            'text/yaml': 'yaml',
            'application/json': 'json',
            'application/x-javascript': 'json',
            'text/javascript': 'json',
            'text/x-javascript': 'json',
            'text/x-json': 'json',
            'dontexists': null
          };
          _results = [];
          for (k in mapping) {
            v = mapping[k];
            if (v === null) {
              _results.push(assert.throws((function() {
                return api.serializer.get_serializer(null, k);
              }), /there is no available serializer for content-type/));
            } else {
              _results.push(assert.equal(v, api.serializer.get_serializer(null, k).key));
            }
          }
          return _results;
        });
      });
    });
    describe('YamlSerializer', function() {
      var api, serializer;
      api = slumber.API(base_url, {
        'format': 'yaml'
      });
      serializer = api.serializer.get_serializer();
      describe('#constructor', function() {
        return it('should be a valid Serializer', function() {
          assert.equal('object', typeof serializer);
          return assert.equal('yaml', serializer.key);
        });
      });
      describe('#loads', function() {
        return it('should loads jyaml encoded string and return a javascript object', function() {
          var ret;
          ret = serializer.loads('a: 42\nb:\n  - 43\n  - 45\n');
          assert.equal('object', typeof ret);
          assert.equal(ret.a, 42);
          return assert.equal(ret.b.length, 2);
        });
      });
      describe('#loads#error', function() {
        return it('should raise an exception', function() {
          return assert.throws((function() {
            return serializer.loads('a: 42\nb:\n  - 43\n     -\n');
          }));
        });
      });
      return describe('#dumps', function() {
        return it('should dumps a javascript object to a yaml encoded string', function() {
          var ret;
          ret = serializer.dumps({
            a: 42,
            b: [43, 45]
          });
          assert.equal('string', typeof ret);
          return assert.equal(ret, 'a: 42\nb:\n  - 43\n  - 45\n');
        });
      });
    });
    describe('JsonSerializer', function() {
      var api, serializer;
      api = slumber.API(base_url, {
        'format': 'json'
      });
      serializer = api.serializer.get_serializer();
      describe('#constructor', function() {
        return it('should be a valid Serializer', function() {
          assert.equal('object', typeof serializer);
          return assert.equal('json', serializer.key);
        });
      });
      describe('#loads', function() {
        return it('should loads json encoded string and return a javascript object', function() {
          var ret;
          ret = serializer.loads('{"a": 42, "b": [43, 45]}');
          assert.equal('object', typeof ret);
          assert.equal(ret.a, 42);
          return assert.equal(ret.b.length, 2);
        });
      });
      describe('#loads#error', function() {
        return it('should raise an exception', function() {
          return assert.throws((function() {
            return serializer.loads('{"a": 42, "b": [43, 45]');
          }));
        });
      });
      return describe('#dumps', function() {
        return it('should dumps a javascript object to a json encoded string', function() {
          var ret;
          ret = serializer.dumps({
            a: 42,
            b: [43, 45]
          });
          assert.equal('string', typeof ret);
          return assert.equal(ret, '{"a":42,"b":[43,45]}');
        });
      });
    });
    return describe('UnknownSerializer', function() {
      return describe('#constructor', function() {
        return it('should be an empty Serializer', function() {
          var api, serializer;
          api = slumber.API(base_url, {
            'format': 'dontexists'
          });
          serializer = api.serializer.get_serializer();
          return assert.equal(void 0, serializer);
        });
      });
    });
  });

  describe('Local Express', function() {
    var api;
    api = null;
    before(function(done) {
      return freeport(function(err, port) {
        return app.listen(port, function() {
          return api = slumber.API("http://localhost:" + port + "/", {}, function() {
            return done();
          });
        });
      });
    });
    return describe('Connection', function() {
      it('should connect to express and return a string Hello World', function(done) {
        return api.get(function(err, ret) {
          assert.equal(err, null);
          assert.equal(ret, 'Hello World !');
          return done();
        });
      });
      it('should return an array (from json) of customers', function(done) {
        return api('customers').get(function(err, ret) {
          assert.equal(err, null);
          assert.equal('object', typeof ret);
          assert.equal(ret.length, 3);
          return done();
        });
      });
      it('should post data', function(done) {
        return api('test-post').post({
          'user': 'Mickael',
          'age': 42,
          'gender': 'male'
        }, function(err, ret) {
          assert.equal(err, null);
          assert.equal('object', typeof ret);
          assert.equal(ret['parsed-body'].user, 'Mickael');
          assert.equal(ret['parsed-body'].age, 42);
          assert.equal(ret['parsed-body'].gender, 'male');
          return done();
        });
      });
      it('should put data', function(done) {
        return api('test-put').put({
          'test': 42,
          'test2': 'toto'
        }, function(err, ret) {
          assert.equal(err, null);
          assert.equal('object', typeof ret);
          assert.equal(ret['parsed-body'].test, 42);
          assert.equal(ret['parsed-body'].test2, 'toto');
          return done();
        });
      });
      it('should patch data', function(done) {
        return api('test-patch').patch({
          'test': 43,
          'test2': 'titi'
        }, function(err, ret) {
          assert.equal(err, null);
          assert.equal('object', typeof ret);
          assert.equal(ret['parsed-body'].test, 43);
          assert.equal(ret['parsed-body'].test2, 'titi');
          return done();
        });
      });
      it('should return customer object (from json) with id = 1', function(done) {
        return api('customers')(1).get(function(err, ret) {
          assert.equal(ret.user, CUSTOMERS[1].user);
          assert.equal(ret.age, CUSTOMERS[1].age);
          assert.equal(ret.gender, CUSTOMERS[1].gender);
          return done();
        });
      });
      it('should return an array (from json) of customers for gender=male', function(done) {
        return api('customers').get({
          'gender': 'male'
        }, function(err, ret) {
          assert.equal(err, null);
          assert.equal(ret.length, 2);
          return done();
        });
      });
      it('should return an array (from json) of customers for gender=male explicitely defining args', function(done) {
        return api('customers').get({
          'args': {
            'gender': 'male'
          }
        }, function(err, ret) {
          assert.equal(err, null);
          assert.equal(ret.length, 2);
          return done();
        });
      });
      it('should not detect yaml content-type and return an object', function(done) {
        return api('customers-yml').get(function(err, ret) {
          assert.equal(null, err);
          assert.equal('string', typeof ret);
          return done();
        });
      });
      return it('should detect yaml content-type and return an object', function(done) {
        return api('customers-yml-with-header').get(function(err, ret) {
          assert.equal(null, err);
          assert.equal('object', typeof ret);
          assert.equal('Alfred', ret[1].user);
          return done();
        });
      });
    });
  });

}).call(this);
