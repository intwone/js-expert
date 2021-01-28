const Request = require("./request")

const DEFAULT_OPTIONS = {
  /**
   * Máximo de retentativa que irá ser realizado na chamada na API
   */
  maxRetries: 4,

  /**
   * Tempo máximo de espera no retorno da requisição na API
   */
  maxRequestTimeout: 1000,

  /**
   * Tempo de espera para tentar uma nova requisição na API
   */
  retryTimeout: 1000,

  /**
   * Tempo de intervalo entre uma requisição e outra
   */
  threshold: 200
}

class Pagination {
  constructor(options = DEFAULT_OPTIONS) {
    this.request = new Request()

    this.maxRetries = options.maxRetries
    this.maxRequestTimeout = options.maxRequestTimeout
    this.retryTimeout = options.retryTimeout
    this.threshold = options.threshold
  }

  async handleRequest({ url, page, retries = 1 }) {
    try {
      const finalURL = `${url}?tid=${page}`
      const result = await this.request.makeRequest({
        url: finalURL,
        method: 'get',
        timeout: this.maxRequestTimeout
      })

      return result

    } catch (error) {
      if(retries === this.maxRetries) {
        console.error(`[${retries}] max retries reached!`)
        throw error
      }

      console.error(`[${retries}] an error: [${error.message}] has happened! trying again in ${this.retryTimeout}ms`)

      await Pagination.sleep(this.retryTimeout)

      return this.handleRequest({ url, page, retries: retries += 1 })
    }
  }

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async * getPaginated({ url, page }) {
    const result = await this.handleRequest({ url, page })

    /**
     * Se o resultado de result[result.length - 1] for undefined, coloque o valor zero (0) no tid
     */
    const lastID = result[result.length - 1]?.tid ?? 0

    if(lastID === 0) return

    yield result

    await Pagination.sleep(this.threshold)

    yield * this.getPaginated({ url, page: lastID })
  }
}

module.exports = Pagination

