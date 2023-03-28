const isKeyML = (key) => {
  if (key.endsWith("_en") || key.endsWith("_de")) {
    return true;
  }
  return false;
};

module.exports = {
    isKeyML
}