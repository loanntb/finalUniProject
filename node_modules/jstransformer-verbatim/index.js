'use strict'

exports.name = 'verbatim'
exports.outputFormat = 'html'

exports.render = function (str) {
  return '\n' + str + '\n'
}
