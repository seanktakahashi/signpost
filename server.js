let express = require('express');

const publicSignpost = 'public-signpost';
let app1 = express();
app1.use(express.static(publicSignpost));
// public signpost
const server1 = app1.listen(1111, () => {
  const port = server1.address().port;
  console.log(`${publicSignpost} server started at http://localhost:${port}`);
});

const privateSignpost = 'private-signpost';
let app2 = express();
app2.use(express.static(privateSignpost));
// make custom routes to resources
const server2 = app2.listen(2222, () => {
  const port = server2.address().port;
  console.log(`${privateSignpost} server started at http://localhost:${port}`);
});

