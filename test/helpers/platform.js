module.exports = class helper {
  setPlatform(platform) {
    this.originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {value: platform});
  }

  resetPlatform() {
    Object.defineProperty(process, 'platform', {value: this.originalPlatform});
  }
};
