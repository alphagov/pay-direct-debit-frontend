'use strict'

module.exports = (req, res) => {
  const params = {
    countries: [
      {
        name: 'United Kingdom',
        value: 'UK',
        selected: true
      },
      {
        name: 'France',
        value: 'FR',
        selected: false
      }
    ]
  }
  res.render('app/index/get', params)
}
