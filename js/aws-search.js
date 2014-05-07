define([
    "dojo/_base/lang",
    "dojo/json"
], function(
    lang,
    JSON
) {

    var search = {
        create: function(elementSelector, callback, zoomTo) {
            this.setExtent = callback;
            this.zoomTo = zoomTo;
            var addresses = new Bloodhound({
                name: 'ago-geocode',
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 15,
                remote: {
                    url: 'http://webapi.aws.dk/adresser.json?q=%QUERY&maxantal=20',
                    rateLimitWait: 300,
                    filter: function(response) {
                        console.log(response);
                        return $.map(response, function(location) {
                            return {
                                text: (location.husnr) ? location.vejnavn.navn + ' ' + location.husnr + ', ' + location.postnummer.nr : location.vejnavn.navn + ', ' + location.postnummer.nr,
                                magicKey: location.vejnavn.kode,
                                url: location.vejnavn.href,
                                lng: location.wgs84koordinat['længde'],
                                lat: location.wgs84koordinat['bredde']
                            };
                        });
                    },
                    ajax: {
                        type: "GET",
                        dataType: "jsonp"
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
        },
        setExtent: null,
        zoomTo: null,
        parseResponse: function(data) {
            var result = JSON.parse(data);
            this.setExtent(result.locations[0].extent);
        },
        selected: function($e, datum) {
            if (datum.lng === '0.0' || datum.lat === '0.0') {
                var request = $.ajax(datum.url, {
                    context: $e.data.context,
                    type: "GET",
                    dataType: "jsonp"
                });
                request.done(function(data) {
                    $e.data.context.zoomTo([data.wgs84koordinat['længde'], data.wgs84koordinat['bredde']]);
                });
            } else {
                $e.data.context.zoomTo([datum.lng, datum.lat]);
            }
        }
    }
    return search;
});
