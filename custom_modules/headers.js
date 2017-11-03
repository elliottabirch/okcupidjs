// Sets the OAuth token. Used by client when logging in.
class Headers {
  constructor(oAuthToken) {
    this.oAuthToken = oAuthToken;
    this.setOAuthToken = this.setOAuthToken.bind(this);
    this.clearOAuthToken = this.clearOAuthToken.bind(this);
    this.getHeaders = this.getHeaders.bind(this);
  }

  setOAuthToken(token) {
    this.oAuthToken = token;
  }

  clearOAuthToken() {
    this.oAuthToken = '';
  }

  getHeaders() {
    if (this.oAuthToken) {
      return {
        'x-okcupid-platform': 'DESKTOP',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36',
        authorization: `Bearer ${this.oAuthToken}`,
      };
    }

    return {
      'x-okcupid-platform': 'DESKTOP',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36',
    };
  }
}

module.exports = Headers;
