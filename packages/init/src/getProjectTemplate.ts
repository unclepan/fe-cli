import utils from '@ccub/cli-utils';

const { request } = utils;

export default () => request({
    url: '/project/template',
});
