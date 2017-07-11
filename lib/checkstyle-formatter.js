var checkstyleVersion = '4.3';
var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};
var createEscaper = function(map) {
    var escaper = function(match) {
        return map[match];
    };
    var source = '(?:' + ['&', '<', '>', '"', "'", '`'].join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
        string = string == null ? '' : '' + string;
        return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
};
var _escape = createEscaper(escapeMap);

module.exports = function(stylelintResults) {
    var xml = '<?xml version="1.0" encoding="utf-8"?>';
    xml += '\n<checkstyle version="' + checkstyleVersion + '">';
    stylelintResults.forEach(function(stylelintResult) {
        xml += '\n  <file name="' + _escape(stylelintResult.source) + '">';
        if (!stylelintResult.warnings.length) {
            xml += '</file>';
            return;
        }
        stylelintResult.warnings.forEach(function(warning) {
            xml += '\n    <error source="' + escape('stylelint.rules.' + warning.rule) + '" ';
            xml += 'line="' + _escape(warning.line) + '" ';
            xml += 'column="' + _escape(warning.column) + '" ';
            xml += 'severity="' + _escape(warning.severity) + '" ';
            xml += 'message="' + _escape(warning.text) + '" ';
            xml += '/>';
        });
        xml += '\n  </file>';
    });
    xml += '\n</checkstyle>';
    return xml;
}