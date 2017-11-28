'use strict'

module.exports.index = (req, res) => {
  const data = {
    data: 'Dan'
  }
  res.render('layout', data)
}
