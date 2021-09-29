let express = require('express');

const signpost = 'signpost';
const app1 = express();
app1.use(express.static(signpost));
// public signpost
const server1 = app1.listen(1111, () => {
  const port = server1.address().port;
  console.log(`${signpost} server started at http://localhost:${port}`);
});
