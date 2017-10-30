'use strict'

module.exports.healthcheck = function (req, res) {
  let data = {'ping': {'healthy': true}}
  res.setHeader('Content-Type', 'application/json')
  res.json(data)
}
