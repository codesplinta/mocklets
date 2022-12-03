const sinon = require('sinon');
const $Date = sinon.createStubInstance(self ? self.Date : global.Date);
$Date.now = sinon.spy();