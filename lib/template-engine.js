/**
 * This file is a version of https://github.com/steveukx/hogan-middleware adapted for our requirements.
 */
const path = require('path')
const hogan = require('hogan.js')
const readDir = require('readdir')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const staticify = require('staticify')(path.join(__dirname, '../public'))

function TemplateEngine () {
}

/**
 * All active directory file system watches
 * @type {fs.FSWatcher[]}
 * @ignore
 */
TemplateEngine._watches = []

/**
 * Called by the express server to get the content for a given template at the templatePath supplied. The templateData
 * can contain any content from a configured route, and will be made available to the templates.
 *
 * Templates can include partials by name for any template also in the views directory, note that if sub-directories are
 * used to create included partials, express will not necessarily recognise that file as a valid view path... you've been
 * warned.
 *
 * @param {String} templatePath Path to the template
 * @param {Object} templateData Data to give to the template
 * @param {Function} next Callback to receive two arguments, an error object and the template result.
 */
TemplateEngine.__express = function (templatePath, templateData, next) {
  const templatePaths = [templateData.settings.views, templateData.settings.vendorViews]
  let templateName

  for (let i = 0, j = templatePaths.length; i < j; i++) {
    if (templatePath.indexOf(templatePaths[i]) === 0) {
      templateName = TemplateEngine._getTemplateName(templatePaths[i], templatePath)

      break
    }
  }

  if (!templateName) {
    templateName = path.basename(templatePath, path.extname(templatePath))
  }

  const templates = TemplateEngine._getTemplates(templatePaths)
  let output = null
  let error = null
  let i18n = fs.readFileSync('./locales/en.json', 'utf8')
  templateData.i18n = JSON.parse(i18n)
  templateData.i18nAsString = i18n
  const app = require(path.join(__dirname, '/../server.js')).getApp
  templateData.jsPath = app.get('settings').getVersionedPath('/javascripts/application.js')
  templateData.cssPath = app.get('settings').getVersionedPath('/stylesheets/application.min.css')

  try {
    output = templates[templateName].render(templateData, templates)
    output = staticify.replacePaths(output)
  } catch (e) {
    error = e
  } finally {
    next(error, output)
  }
}

/**
 * Remove the base path from a template path, and the extension to generate the template name
 *
 * @param {String} basePath
 * @param {String} templatePath
 * @returns {String}
 * @private
 */
TemplateEngine._getTemplateName = function (basePath, templatePath) {
  const relativePath = path.relative(basePath, templatePath)
  const templateName = path.join(path.dirname(relativePath), path.basename(templatePath, path.extname(templatePath)))
  return templateName
}

/**

 *
 * @param {function} templatePath
 */

/**
 * Return a function that stores an individual template based on the supplied path, the name of the template is the
 * file's relative path without the extension.
 *
 * @param basePath
 * @returns {Function}
 * @private
 */
TemplateEngine._storeTemplate = function (basePath) {
  return function (templatePath) {
    const templateName = TemplateEngine._getTemplateName(basePath, templatePath)

    TemplateEngine.__templates[templateName] = hogan.compile(fs.readFileSync(templatePath, 'utf-8'))

    if (argv.verbose) {
      console.log('Stored template', templateName)
    }
  }
}

/**
 * Gets all templates, when the template path hasn't yet been scanned it will be read synchronously to ensure there are
 * always templates available.
 *
 * @param {Array} templatePaths
 */
TemplateEngine._getTemplates = function (templatePaths) {
  TemplateEngine.__templates = {}
  for (var i = 0, j = templatePaths.length; i < j; i++) {
    readDir.readSync(templatePaths[i], ['**.html', '**.mustache'], readDir.ABSOLUTE_PATHS)
      .forEach(TemplateEngine._storeTemplate(templatePaths[i]), TemplateEngine)
  }
  return TemplateEngine.__templates
}

module.exports = TemplateEngine
