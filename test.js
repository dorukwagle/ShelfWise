const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var requestCounter = 0;

var responses = {
  /* Keyed by room Id =*/
  "room_abc" : [ /* array of responses */]
};

app.get('/', function (req, res) {
    requestCounter += 1;

    var room = /* assuming request is for room_abc */ "room_abc";

    // Stash the response and reply later when an event comes through
    responses[room].push(res);

    // Every 3rd request, assume there is an event for the chat room, room_abc.
    // Reply to all of the response object for room abc.
    if (requestCounter % 3 === 0) {
        responses["room_abc"].forEach((res) => {
            res.send("room member 123 says: hi there!");
            res.end();
        });

        responses[room] = [];
    }
});

app.use(bodyParser.text({ type: 'text/*' }));
app.use(bodyParser.json());

app.listen(9999, function () {
    console.log('Example app listening on port 9999!')
})