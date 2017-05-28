
Backdrop.t("Standard Call t");
Backdrop
.
t
(
"Whitespace Call t"
)
;

Backdrop.t('Single Quote t');
Backdrop.t('Single Quote \'Escaped\' t');
Backdrop.t('Single Quote ' + 'Concat ' + 'strings ' + 't');

Backdrop.t("Double Quote t");
Backdrop.t("Double Quote \"Escaped\" t");
Backdrop.t("Double Quote " + "Concat " + "strings " + "t");

Backdrop.t("Context Unquoted t", {}, {context: "Context string unquoted"});
Backdrop.t("Context Single Quoted t", {}, {'context': "Context string single quoted"});
Backdrop.t("Context Double Quoted t", {}, {"context": "Context string double quoted"});

Backdrop.t("Context !key Args t", {'!key': 'value'}, {context: "Context string"});

Backdrop.formatPlural(1, "Standard Call plural", "Standard Call @count plural");
Backdrop
.
formatPlural
(
1,
"Whitespace Call plural",
"Whitespace Call @count plural"
)
;

Backdrop.formatPlural(1, 'Single Quote plural', 'Single Quote @count plural');
Backdrop.formatPlural(1, 'Single Quote \'Escaped\' plural', 'Single Quote \'Escaped\' @count plural');

Backdrop.formatPlural(1, "Double Quote plural", "Double Quote @count plural");
Backdrop.formatPlural(1, "Double Quote \"Escaped\" plural", "Double Quote \"Escaped\" @count plural");

Backdrop.formatPlural(1, "Context Unquoted plural", "Context Unquoted @count plural", {}, {context: "Context string unquoted"});
Backdrop.formatPlural(1, "Context Single Quoted plural", "Context Single Quoted @count plural", {}, {'context': "Context string single quoted"});
Backdrop.formatPlural(1, "Context Double Quoted plural", "Context Double Quoted @count plural", {}, {"context": "Context string double quoted"});

Backdrop.formatPlural(1, "Context !key Args plural", "Context !key Args @count plural", {'!key': 'value'}, {context: "Context string"});
