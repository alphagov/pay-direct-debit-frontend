'use strict'

module.exports = (req, res) => {
  let data = { 'ping': { 'healthy': true } }
  res.setHeader('Content-Type', 'application/json')
  res.json(data)
}
