const Pagination = require("./pagination");

;(async () => {
  const pagination = new Pagination()

  const firtPage = 770e3

  const request = pagination.getPaginated({
    url: 'https://www.mercadobitcoin.com.br/api/BTC/trades/',
    page: firtPage
  })

  for await (const items of request) {
    console.table(items)
  }
})()
