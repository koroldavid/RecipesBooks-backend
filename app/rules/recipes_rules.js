const LIVR = require('livr');

LIVR.Validator.defaultAutoTrim(true);

const validateCreate = new LIVR.Validator({
    title       : ['required', { min_length: 5 }],
    description : ['required', { min_length: 5 }],
    guide       : ['required', { min_length: 10 }],
    ingredients : ['required', { min_length: 10 }]
});
// they are the same, but my vision of architecture says another :)
const validateUpdate = new LIVR.Validator({
    title       : ['required', { min_length: 5 }],
    description : ['required', { min_length: 5 }],
    guide       : ['required', { min_length: 10 }],
    ingredients : ['required', { min_length: 10 }]
});

module.exports = {
    create : validateCreate,
    update : validateUpdate
}