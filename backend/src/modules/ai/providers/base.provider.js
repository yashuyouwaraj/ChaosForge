class BaseProvider {
  async generate() {
    throw new Error("generate() must be implemented.");
  }

  async stream() {
    throw new Error("stream() must be implemented.");
  }
}

module.exports = BaseProvider;
