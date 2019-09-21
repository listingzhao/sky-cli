'use strict';
const path = require('path')
const loaderUtils = require('loader-utils')

module.exports = function getCssModuleLocalIdent(
    context,
    localIdentName,
    localName,
    options
) {
    const fileNameOrFolder = context.resourcePath.match(/index\.m\.(css|less)$/)
        ? '[folder]'
        : '[name]'
    const hash = loaderUtils.getHashDigest(
        path.posix.relative(context.rootContext, context.resourcePath) +
            localName,
        'md5',
        'base64',
        5
    )
    const className = loaderUtils.interpolateName(
        context,
        `${fileNameOrFolder}_${localName}__${hash}`,
        options
    )

    return className.replace('.m_', '_')
}