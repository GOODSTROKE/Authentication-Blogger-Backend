const randomValueFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

const randomMultipleFromArray = (array, count) => {
  const shuffledList = array.sort(() => Math.random() - 0.5)
  const newArraySize = Math.floor(Math.random() * array.length)
  return shuffledList.slice(0, count ? count : newArraySize)
}

module.exports = { randomValueFromArray, randomMultipleFromArray }
