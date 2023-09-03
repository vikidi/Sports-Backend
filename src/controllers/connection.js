const polarWebhook = (req, res) => {
  console.log(res);
  console.log(res.body);
  res.sendStatus(200);
};

module.exports = {
  polarWebhook,
};
