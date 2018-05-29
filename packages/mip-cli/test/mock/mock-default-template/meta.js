
module.exports = {
    prompts: {
        name: {
            type: 'string',
            default: 'mip-project',
            message: '项目名称',
        },
        description: {
            type: 'string',
            message: '项目描述',
            default: 'A MIP project',
        },
        author: {
            type: 'string',
            message: '作者信息',
            default: "yourname"
        }
    }
};