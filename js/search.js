define([
    "dojo/_base/lang",
    "dojo/json",
    "dojo/cookie",
    "dojo/Deferred",
    "dojo/io-query",
    "esri/IdentityManager",
    "dojo/hash"
], function(
    lang,
    JSON,
    cookie,
    Deferred,
    ioQuery,
    IdentityManager,
    hash
) {

    var search = {
        create: function(elementSelector, callback) {
            this.setExtent = callback;
            var addresses = new Bloodhound({
                name: 'ago-geocode',
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=%QUERY&maxLocations=2&f=pjson',
                    filter: function(response) {
                        return $.map(response.suggestions, function(location) {
                            return {
                                text: location.text,
                                magicKey: location.magicKey
                            };
                        });
                    }
                }
            });

            addresses.initialize();

            $(elementSelector).typeahead(null, {
                name: 'text',
                displayKey: 'text',
                source: addresses.ttAdapter()
            }).on('typeahead:selected', {
                context: this
            }, this.selected);
            /*
            var context = this;
            $(elementSelector).keypress(context, function(e) {
                if (e.which == 13) {
                    console.log($('input' + elementSelector).data());

                    var typeahead = $('input' + elementSelector + '.tt-input')[0];
                    //var $form = $typeahead.parents('form').first();
                    var value = typeahead.value;
                    var url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text=' + value + '&f=json';
            
                    var request = $.ajax(url, {
                        context: e.data
                    });
                    request.done(e.data.parseResponse);
                    return true;
                }
            }); */
        },
        setExtent: null,
        parseResponse: function(data) {
            var result = JSON.parse(data);
            this.setExtent(result.locations[0].extent);
        },
        selected: function($e, datum) {
            var url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text=' + datum.text + '&magicKey=' + datum.magicKey + '&f=json';
            var result;
            var request = $.ajax(url, {
                context: $e.data.context
            });
            request.done($e.data.context.parseResponse);
        }

    }

    return search;

});
